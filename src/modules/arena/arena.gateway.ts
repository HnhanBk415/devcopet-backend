import { Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Namespace, Socket } from 'socket.io';
import { ARENA_BOT_FALLBACK_SECONDS } from './constants/arena.constants';
import { FindMatchDto } from './dto/find-match.dto';
import {
  LeaveRoomDto,
  MatchDecisionDto,
  SubmitAnswerDto,
} from './dto/submit-answer.dto';
import { ArenaAuthService } from './services/arena-auth.service';
import {
  ArenaMatchmakingService,
  ArenaQueueEntry,
} from './services/arena-matchmaking.service';
import { ArenaRoomService } from './services/arena-room.service';
import type { ArenaMode, ArenaSocketUser } from './types/arena.types';
function normalizeOrigin(origin?: string): string | undefined {
  return origin?.replace(/\/+$/, '');
}

function splitOrigins(value?: string): string[] {
  return (value ?? '')
    .split(',')
    .map((origin) => normalizeOrigin(origin.trim()))
    .filter((origin): origin is string => Boolean(origin));
}

const arenaAllowedOrigins = Array.from(
  new Set([
    ...splitOrigins(process.env.FRONTEND_URL),
    ...splitOrigins(process.env.CORS_ORIGIN),
    'http://localhost:5173',
  ]),
);

function isAllowedVercelPreview(origin: string): boolean {
  return /^https:\/\/devcopet-[a-zA-Z0-9-]+.*\.vercel\.app$/.test(origin);
}

function isArenaCorsOriginAllowed(origin?: string) {
  if (!origin) return true;
  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin) return false;
  if (arenaAllowedOrigins.includes(normalizedOrigin)) return true;
  return (
    isAllowedVercelPreview(normalizedOrigin) ||
    /^http:\/\/localhost:\d+$/.test(normalizedOrigin) ||
    /^http:\/\/127\.0\.0\.1:\d+$/.test(normalizedOrigin)
  );
}
@WebSocketGateway({
  namespace: 'arena',
  cors: {
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      callback(null, isArenaCorsOriginAllowed(origin));
    },
    credentials: true,
  },
})
export class ArenaGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Namespace;

  private readonly logger = new Logger(ArenaGateway.name);
  private readonly waitingTimers = new Map<
    string,
    { interval?: NodeJS.Timeout; botFallback?: NodeJS.Timeout }
  >();

  constructor(
    private readonly authService: ArenaAuthService,
    private readonly matchmakingService: ArenaMatchmakingService,
    private readonly roomService: ArenaRoomService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      await this.authService.authenticateSocket(client);
    } catch (error) {
      client.emit('arena:error', {
        message:
          error instanceof Error ? error.message : 'Authentication failed.',
        code: 'AUTH_FAILED',
      });
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket) {
    const socketData = client.data as { user?: ArenaSocketUser };
    const user = socketData.user;
    if (user?.userId) {
      this.stopWaiting(user.userId);
      this.matchmakingService.cancel(user.userId);
      await this.roomService.handleDisconnect(this.server, user.userId);
    }
    this.matchmakingService.removeSocket(client.id);
  }

  @SubscribeMessage('arena:find_match')
  async handleFindMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ) {
    try {
      const dto = await this.validatePayload(FindMatchDto, payload);
      const user = this.getSocketUser(client);
      const mode: ArenaMode = dto.mode ?? 'ranked';
      const entry = await this.matchmakingService.enqueue({
        userId: user.userId,
        socketId: client.id,
        courseSlug: dto.courseSlug,
        mode,
      });

      if (mode === 'practice') {
        await this.roomService.createBotRoom(this.server, entry);
        return;
      }

      const opponent = this.matchmakingService.findHumanMatch(entry);
      if (opponent) {
        this.stopWaiting(entry.userId);
        this.stopWaiting(opponent.userId);
        await this.roomService.createHumanRoom(this.server, entry, opponent);
        return;
      }

      this.startWaiting(entry);
    } catch (error) {
      this.emitError(client, error);
    }
  }

  @SubscribeMessage('arena:cancel_find_match')
  handleCancelFindMatch(@ConnectedSocket() client: Socket) {
    try {
      const user = this.getSocketUser(client);
      this.stopWaiting(user.userId);
      this.matchmakingService.cancel(user.userId);
      client.emit('arena:waiting', {
        status: 'cancelled',
        waitingSeconds: 0,
        estimatedBotFallbackSeconds: ARENA_BOT_FALLBACK_SECONDS,
      });
    } catch (error) {
      this.emitError(client, error);
    }
  }

  @SubscribeMessage('arena:accept_match')
  async handleAcceptMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ) {
    try {
      const dto = await this.validatePayload(MatchDecisionDto, payload);
      this.roomService.acceptMatch(this.server, client, dto.roomId);
    } catch (error) {
      this.emitError(client, error);
    }
  }

  @SubscribeMessage('arena:decline_match')
  async handleDeclineMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ) {
    try {
      const dto = await this.validatePayload(MatchDecisionDto, payload);
      await this.roomService.declineMatch(this.server, client, dto.roomId);
    } catch (error) {
      this.emitError(client, error);
    }
  }

  @SubscribeMessage('arena:submit_answer')
  async handleSubmitAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ) {
    try {
      const dto = await this.validatePayload(SubmitAnswerDto, payload);
      this.roomService.submitAnswer(this.server, client, dto);
    } catch (error) {
      this.emitError(client, error);
    }
  }

  @SubscribeMessage('arena:leave_room')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ) {
    try {
      const dto = await this.validatePayload(LeaveRoomDto, payload);
      await this.roomService.leaveRoom(this.server, client, dto.roomId);
    } catch (error) {
      this.emitError(client, error);
    }
  }

  private startWaiting(entry: ArenaQueueEntry) {
    this.stopWaiting(entry.userId);

    const emitWaiting = () => {
      const socket = this.server.sockets.get(entry.socketId);
      if (!socket) {
        this.stopWaiting(entry.userId);
        this.matchmakingService.cancel(entry.userId);
        return;
      }

      socket.emit('arena:waiting', {
        status: 'waiting',
        waitingSeconds: this.matchmakingService.getWaitingSeconds(entry),
        estimatedBotFallbackSeconds: ARENA_BOT_FALLBACK_SECONDS,
      });
    };

    emitWaiting();
    const interval = setInterval(emitWaiting, 1000);
    const botFallback = setTimeout(() => {
      this.stopWaiting(entry.userId);
      void this.roomService.createBotRoom(this.server, entry).catch((error) => {
        const socket = this.server.sockets.get(entry.socketId);
        if (socket) this.emitError(socket, error);
        this.logger.error(error instanceof Error ? error.stack : error);
      });
    }, ARENA_BOT_FALLBACK_SECONDS * 1000);

    this.waitingTimers.set(entry.userId, { interval, botFallback });
  }

  private stopWaiting(userId: string) {
    const timers = this.waitingTimers.get(userId);
    if (!timers) return;
    if (timers.interval) clearInterval(timers.interval);
    if (timers.botFallback) clearTimeout(timers.botFallback);
    this.waitingTimers.delete(userId);
  }

  private getSocketUser(client: Socket): ArenaSocketUser {
    const socketData = client.data as { user?: ArenaSocketUser };
    const user = socketData.user;
    if (!user?.userId) throw new Error('Unauthenticated socket.');
    return user;
  }

  private async validatePayload<T extends object>(
    dtoClass: new () => T,
    payload: unknown,
  ) {
    const dto = plainToInstance(dtoClass, payload ?? {});
    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      throw new Error('Invalid arena event payload.');
    }

    return dto;
  }

  private emitError(client: Socket, error: unknown) {
    const message = error instanceof Error ? error.message : 'Arena error.';
    client.emit('arena:error', {
      message,
      code: 'ARENA_ERROR',
    });
    this.logger.warn(message);
  }
}
