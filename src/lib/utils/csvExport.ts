// src/lib/utils/csvExport.ts
import type { Game, PlayerStat, TeamStat } from '$lib/types/api';

export interface ExportOptions {
	filename?: string;
	timestamp?: boolean;
}

/**
 * Escapes CSV field values and wraps them in quotes if necessary
 */
function escapeCsvField(value: any): string {
	if (value === null || value === undefined) {
		return '';
	}

	const stringValue = String(value);

	// If the value contains quotes, commas, or newlines, wrap it in quotes
	if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
		// Escape internal quotes by doubling them
		return `"${stringValue.replace(/"/g, '""')}"`;
	}
	return stringValue;
}

/**
 * Converts array of objects to CSV string
 */
function arrayToCsv<T extends Record<string, any>>(data: T[], headers: string[]): string {
	if (data.length === 0) {
		return headers.join(',');
	}

	const csvHeaders = headers.map(escapeCsvField).join(',');

	const csvRows = data.map((item) =>
		headers
			.map((header) => {
				const value = item[header] || item[header.toLowerCase()] || '';
				return escapeCsvField(value);
			})
			.join(',')
	);

	return [csvHeaders, ...csvRows].join('\n');
}

/**
 * Downloads CSV content as a file
 */
function downloadCsv(csvContent: string, filename: string): void {
	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	link.style.display = 'none';

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	// Clean up the URL object
	window.URL.revokeObjectURL(url);
}

/**
 * Generates a timestamp string for filenames
 */
function getTimestamp(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	const hours = String(now.getHours()).padStart(2, '0');
	const minutes = String(now.getMinutes()).padStart(2, '0');
	return `${year}${month}${day}-${hours}${minutes}`;
}

/**
 * Export player statistics to CSV
 */
export function exportPlayerStats(stats: PlayerStat[], options: ExportOptions = {}): void {
	if (stats.length === 0) {
		throw new Error('No player statistics to export');
	}

	const headers = [
		'Player',
		'Team',
		'Conference',
		'Category',
		'Stat Type',
		'Value',
		'Season',
		'Season Type'
	];

	const csvData = stats.map((stat) => ({
		Player: stat.player,
		Team: stat.team,
		Conference: stat.conference,
		Category: stat.category,
		'Stat Type': stat.statType,
		Value: stat.stat,
		Season: stat.season,
		'Season Type': stat.seasonType
	}));

	const csvContent = arrayToCsv(csvData, headers);

	const timestamp = options.timestamp !== false ? `-${getTimestamp()}` : '';
	const filename = options.filename || `player-stats${timestamp}.csv`;

	downloadCsv(csvContent, filename);
}

/**
 * Export team statistics to CSV
 */
export function exportTeamStats(stats: TeamStat[], options: ExportOptions = {}): void {
	if (stats.length === 0) {
		throw new Error('No team statistics to export');
	}

	const headers = ['Team', 'Conference', 'Stat Name', 'Stat Value', 'Season', 'Season Type'];

	const csvData = stats.map((stat) => ({
		Team: stat.team,
		Conference: stat.conference,
		'Stat Name': stat.statName,
		'Stat Value': stat.statValue,
		Season: stat.season,
		'Season Type': stat.seasonType
	}));

	const csvContent = arrayToCsv(csvData, headers);

	const timestamp = options.timestamp !== false ? `-${getTimestamp()}` : '';
	const filename = options.filename || `team-stats${timestamp}.csv`;

	downloadCsv(csvContent, filename);
}

/**
 * Export game results to CSV
 */
export function exportGameResults(games: Game[], options: ExportOptions = {}): void {
	if (games.length === 0) {
		throw new Error('No game results to export');
	}

	const headers = [
		'Season',
		'Week',
		'Season Type',
		'Home Team',
		'Away Team',
		'Home Score',
		'Away Score',
		'Date',
		'Venue',
		'Conference Game',
		'Completed'
	];

	const csvData = games.map((game) => ({
		Season: game.season,
		Week: game.week,
		'Season Type': game.season_type,
		'Home Team': game.home_team,
		'Away Team': game.away_team,
		'Home Score': game.home_points,
		'Away Score': game.away_points,
		Date: game.start_date,
		Venue: game.venue,
		'Conference Game': game.conference_game ? 'Yes' : 'No',
		Completed: game.completed ? 'Yes' : 'No'
	}));

	const csvContent = arrayToCsv(csvData, headers);

	const timestamp = options.timestamp !== false ? `-${getTimestamp()}` : '';
	const filename = options.filename || `game-results${timestamp}.csv`;

	downloadCsv(csvContent, filename);
}

/**
 * Export any generic data to CSV
 */
export function exportGenericData<T extends Record<string, any>>(
	data: T[],
	headers: string[],
	filename: string,
	options: ExportOptions = {}
): void {
	if (data.length === 0) {
		throw new Error('No data to export');
	}

	const csvContent = arrayToCsv(data, headers);

	const timestamp = options.timestamp !== false ? `-${getTimestamp()}` : '';
	const finalFilename = `${filename}${timestamp}.csv`;

	downloadCsv(csvContent, finalFilename);
}

/**
 * Validate if data can be exported
 */
export function canExport(data: any[]): boolean {
	return Array.isArray(data) && data.length > 0;
}

/**
 * Get export summary information
 */
export function getExportSummary(data: any[]): {
	canExport: boolean;
	count: number;
	message: string;
} {
	const count = Array.isArray(data) ? data.length : 0;
	const canExport = count > 0;

	if (!canExport) {
		return {
			canExport: false,
			count: 0,
			message: 'No data available to export'
		};
	}
	return {
		canExport: true,
		count,
		message: `${count} record${count !== 1 ? 's' : ''} ready to export`
	};
}
