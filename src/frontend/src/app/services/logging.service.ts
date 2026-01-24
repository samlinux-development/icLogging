import { Injectable } from '@angular/core';
import { IcAgentService } from './ic-agent.service';
import { environment } from '../../environments/environment';
import type { LogEntry } from '../../../../declarations/backend/backend.did';

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  constructor(private icAgentService: IcAgentService) {}

  /**
   * Add a log entry
   */
  async log(level: string, message: string): Promise<bigint> {
    const actor = await this.icAgentService.getActor();
    const authKey = environment.backendAuthKey;
    if (!authKey) {
      throw new Error('Backend authentication key is not configured');
    }
    return await actor.log(authKey, level, message);
  }

  /**
   * Get all log entries
   */
  async getLogs(): Promise<LogEntry[]> {
    const actor = await this.icAgentService.getActor();
    return await actor.getLogs();
  }

  /**
   * Get a specific log entry by ID
   */
  async getLog(id: bigint): Promise<LogEntry | undefined> {
    const actor = await this.icAgentService.getActor();
    const result = await actor.getLog(id);
    return result[0];
  }

  /**
   * Get the total number of log entries
   */
  async getLogCount(): Promise<bigint> {
    const actor = await this.icAgentService.getActor();
    return await actor.getLogCount();
  }
}
