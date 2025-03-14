// src/routes/api/spotify/search/+server.ts
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '$env/static/private';
import { json } from '@sveltejs/kit';
import type { SongSearchResult } from '../../../app';
import type { RequestHandler } from './$types';

// Define interfaces for type safety
interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string }>;
  album: {
    id: string;
    name: string;
    release_date: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
  duration_ms: number;
  popularity: number;
  external_urls: { spotify: string };
}

// Token cache
let spotifyToken: string | null = null;
let tokenExpiration: number = 0;

async function getSpotifyToken(): Promise<string> {
  const currentTime = Date.now();

  // Return cached token if still valid (with 60s buffer)
  if (spotifyToken && tokenExpiration > currentTime + 60000) {
    return spotifyToken;
  }

  // Request new token
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' +
        Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString(
          'base64',
        ),
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(
      `Failed to get Spotify token: ${response.status} ${response.statusText}`,
    );
  }

  const data: SpotifyTokenResponse = await response.json();

  // Cache token and set expiration
  spotifyToken = data.access_token;
  // Convert expiration from seconds to milliseconds and subtract 5 minutes for safety
  tokenExpiration = currentTime + data.expires_in * 1000 - 300000;

  return spotifyToken;
}

export const GET: RequestHandler = async ({ url }) => {
  try {
    // Get query parameters
    const query = url.searchParams.get('q');
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    // Validate query
    if (!query) {
      return json({ error: 'Search query is required' }, { status: 400 });
    }

    // Get access token
    const token = await getSpotifyToken();

    // Search Spotify
    const searchUrl = new URL('https://api.spotify.com/v1/search');
    searchUrl.searchParams.append('q', query);
    searchUrl.searchParams.append('type', 'track');
    searchUrl.searchParams.append('limit', limit.toString());

    const searchResponse = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!searchResponse.ok) {
      throw new Error(
        `Spotify search failed: ${searchResponse.status} ${searchResponse.statusText}`,
      );
    }

    const searchData = await searchResponse.json();
    const tracks: SpotifyTrack[] = searchData.tracks.items;

    // Transform results
    const results: SongSearchResult[] = tracks.map((track) => ({
      id: track.id,
      name: track.name,
      artists: track.artists.map((artist) => artist.name),
      album: track.album.name,
      releaseDate: track.album.release_date,
      duration: Math.round(track.duration_ms / 1000),
      popularity: track.popularity,
      coverImageUrl: track.album.images[0]?.url || '',
      spotifyUrl: track.external_urls.spotify,
    }));

    return json({ results });
  } catch (error) {
    console.error('Spotify API error:', error);
    return json(
      {
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 },
    );
  }
};
