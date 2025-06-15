// src/routes/api/health/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { cfbdApi } from '$lib/api/cfbdClient';
import { CFBD_API_KEY } from '$env/static/private';

export const GET: RequestHandler = async () => {
	try {
		console.log('🔍 Health check requested');
		
		// Check environment
		const checks = {
			environment: process.env.NODE_ENV || 'unknown',
			timestamp: new Date().toISOString(),
			apiKeyConfigured: !!CFBD_API_KEY,
			apiKeyLength: CFBD_API_KEY ? CFBD_API_KEY.length : 0,
			nodeVersion: process.version,
			upstreamApiAccessible: false,
			upstreamApiMessage: 'Not tested'
		};

		// Test upstream API if key is available
		if (CFBD_API_KEY) {
			try {
				type HealthResult = { healthy: boolean; message: string } | boolean;
				const healthResult: HealthResult = await cfbdApi.healthCheck();
				if (typeof healthResult === 'object' && healthResult !== null && 'healthy' in healthResult && 'message' in healthResult) {
					checks.upstreamApiAccessible = (healthResult as { healthy: boolean }).healthy;
					checks.upstreamApiMessage = (healthResult as { message: string }).message;
				} else if (typeof healthResult === 'boolean') {
					checks.upstreamApiAccessible = healthResult;
					checks.upstreamApiMessage = healthResult ? 'Healthy' : 'Unhealthy';
				} else {
					checks.upstreamApiAccessible = false;
					checks.upstreamApiMessage = 'Unexpected health check result';
				}
			} catch (error) {
				checks.upstreamApiMessage = error instanceof Error ? error.message : 'Unknown error';
			}
		}

		const isHealthy = checks.apiKeyConfigured && checks.upstreamApiAccessible;

		return json(
			{
				status: isHealthy ? 'healthy' : 'unhealthy',
				checks,
				recommendations: !isHealthy ? [
					!checks.apiKeyConfigured && 'Set CFBD_API_KEY environment variable',
					!checks.upstreamApiAccessible && 'Check API key permissions and network connectivity'
				].filter(Boolean) : []
			},
			{ 
				status: isHealthy ? 200 : 503,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Cache-Control': 'no-cache'
				}
			}
		);

	} catch (error) {
		console.error('❌ Health check failed:', error);
		
		return json(
			{
				status: 'error',
				error: error instanceof Error ? error.message : 'Unknown error',
				timestamp: new Date().toISOString()
			},
			{ 
				status: 500,
				headers: {
					'Access-Control-Allow-Origin': '*'
				}
			}
		);
	}
};