import { Injectable } from '@angular/core';
import { Actor, HttpAgent } from '@icp-sdk/core/agent';
import { Principal } from '@icp-sdk/core/principal';
import { environment } from '../../environments/environment';
import { idlFactory } from '../../../../declarations/backend/backend.did.js';
import type { _SERVICE } from '../../../../declarations/backend/backend.did';

@Injectable({
  providedIn: 'root'
})
export class IcAgentService {
  private actor: _SERVICE | null = null;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    // Initialize actor asynchronously
    this.initializeActor();
  }

  /**
   * Initialize the IC agent and actor
   */
  private async initializeActor(): Promise<void> {
    // If already initializing, return the existing promise
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._doInitialize();
    return this.initializationPromise;
  }

  private async _doInitialize(): Promise<void> {
    try {
      // Get canister ID from environment (reads from .env file via dfx or window variables)
      const canisterIdText = environment.backendCanisterId;
      
      if (!canisterIdText) {
        console.error('Invalid canister ID. Please ensure the backend canister is deployed and the canister ID is set correctly.');
        throw new Error('Canister ID not configured. Run "dfx deploy" to deploy the backend canister.');
      }
      
      // Determine network from window, process, or environment
      // Priority: window variable > process env > environment.production flag
      let network: string | undefined;
      if (typeof window !== 'undefined' && (window as any).__DFX_NETWORK__) {
        network = (window as any).__DFX_NETWORK__;
      } else if (typeof process !== 'undefined' && process.env?.['DFX_NETWORK']) {
        network = process.env['DFX_NETWORK'];
      } else if (environment.production === true) {
        // Explicitly check for true (not just truthy) to ensure production build
        network = 'ic';
      } else if (environment.production === false) {
        // Explicitly check for false to ensure local development
        network = 'local';
      }
      
      // If network cannot be determined, throw an error
      if (!network) {
        throw new Error(`Network cannot be determined. Canister ID: ${canisterIdText}, production: ${environment.production}. Please set DFX_NETWORK environment variable or ensure environment.production is configured correctly.`);
      }
      
      const host = network === 'ic' 
        ? 'https://icp-api.io' 
        : 'http://127.0.0.1:8080';
      
      // Only log network detection in development mode
      if (!environment.production) {
        console.log('Network detection:', {
          network,
          host,
          production: environment.production,
          canisterId: canisterIdText,
          windowNetwork: typeof window !== 'undefined' ? (window as any).__DFX_NETWORK__ : 'N/A',
          processNetwork: typeof process !== 'undefined' ? process.env?.['DFX_NETWORK'] : 'N/A'
        });
      }
      // Create agent using the new API
      const agent = await HttpAgent.create({ host });
      
      // In development, fetch root key
      if (network !== 'ic') {
        await agent.fetchRootKey();
      }

      // Convert canister ID string to Principal
      const canisterId = Principal.fromText(canisterIdText);

      // Use the generated idlFactory from declarations
      this.actor = Actor.createActor(idlFactory, {
        agent,
        canisterId
      });
    } catch (error) {
      console.error('Error initializing actor:', error);
      this.initializationPromise = null; // Reset so it can be retried
      throw error;
    }
  }

  /**
   * Get the actor instance, ensuring it's initialized
   */
  async getActor(): Promise<_SERVICE> {
    if (!this.actor) {
      await this.initializeActor();
    }
    if (!this.actor) {
      throw new Error('Actor not initialized');
    }
    return this.actor;
  }

  /**
   * Check if the actor is initialized
   */
  isInitialized(): boolean {
    return this.actor !== null;
  }
}
