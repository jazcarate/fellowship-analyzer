import { useMemo } from 'preact/hooks';
import { useAnalysis } from '../contexts/analysis-context';
import { getDungeonConfig } from '../constants';
import type { Position, Hero } from '../types';

interface PlayerEntity {
  type: 'player';
  id: string;
  name: string;
  hero: Hero;
  position: Position;
}

interface NPCEntity {
  type: 'npc';
  id: string;
  name: string;
  position: Position;
}

type Entity = PlayerEntity | NPCEntity;
type SnapshotData = Record<string, Entity>;

export function Minimap() {
  const { hoveredTime, dungeon } = useAnalysis();

  const dungeonConfig = getDungeonConfig(dungeon.dungeonId);

  const spatialIndex = useMemo(() => {
    const duration = dungeon.endTime
      ? Math.ceil((dungeon.endTime - dungeon.startTime) / 1000)
      : 0;

    if (duration === 0) return [];

    const snapshots: SnapshotData[] = Array.from({ length: duration }, () => ({}));

    const getPlayer = (playerId: string) => dungeon.players.find(p => p.playerId === playerId)!;

    for (const event of dungeon.events) {
      const secondOffset = Math.floor((event.timestamp - dungeon.startTime) / 1000);
      if (secondOffset < 0 || secondOffset >= duration) continue;

      const snapshot = snapshots[secondOffset]!;

      if (event.type === 'SWING_DAMAGE' ||
        event.type === 'ABILITY_DAMAGE' ||
        event.type === 'ABILITY_PERIODIC_DAMAGE') {

        if (event.sourceId.startsWith("Player-")) {
          const sourcePlayer = getPlayer(event.sourceId);
          snapshot[event.sourceId] = {
            type: 'player',
            id: event.sourceId,
            name: sourcePlayer.playerName,
            hero: sourcePlayer.hero,
            position: event.sourcePosition
          };
        } else if (event.sourceId.startsWith("Npc-")) {
          snapshot[event.sourceId] = {
            type: 'npc',
            id: event.sourceId,
            name: event.sourceName || 'Unknown',
            position: event.sourcePosition
          };
        }

        if (event.targetId.startsWith("Player-")) {
          const targetPlayer = getPlayer(event.targetId);
          snapshot[event.targetId] = {
            type: 'player',
            id: event.targetId,
            name: targetPlayer.playerName,
            hero: targetPlayer.hero,
            position: event.targetPosition
          };
        } else if (event.targetId.startsWith("Npc-")) {
          snapshot[event.targetId] = {
            type: 'npc',
            id: event.targetId,
            name: event.targetName || 'Unknown',
            position: event.targetPosition
          };
        }

      } else if (event.type === 'ABILITY_ACTIVATED') {
        const player = getPlayer(event.playerId);
        if (player) {
          snapshot[event.playerId] = {
            type: 'player',
            id: event.playerId,
            name: player.playerName,
            hero: player.hero,
            position: event.position
          };
        }
      }
    }

    return snapshots;
  }, [dungeon]);

  const currentSnapshot = useMemo(() => {
    if (!hoveredTime || !spatialIndex.length) return {};

    const secondIndex = Math.floor(hoveredTime);
    if (secondIndex < 0 || secondIndex >= spatialIndex.length) return {};

    return spatialIndex[secondIndex] || {};
  }, [spatialIndex, hoveredTime]);

  const worldToMap = (worldPos: Position, mapWidth: number, mapHeight: number): { x: number; y: number } | null => {
    if (!worldPos || !dungeonConfig) return null;

    const bounds = dungeonConfig.worldBounds;
    const worldWidth = bounds.maxX - bounds.minX;
    const worldHeight = bounds.maxY - bounds.minY;

    if (worldWidth === 0 || worldHeight === 0) return null;

    const x = ((worldPos.x - bounds.minX) / worldWidth) * mapWidth;
    const y = (1 - (worldPos.y - bounds.minY) / worldHeight) * mapHeight;

    return { x, y };
  };

  const mapWidth = 350;
  const mapHeight = 350;

  return (
    <div style={{
      background: '#fff',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
      minHeight: '400px'
    }}>
      <h4 style={{ marginTop: 0, marginBottom: '15px' }}>Dungeon Map</h4>

      {!dungeonConfig ? (
        <div style={{
          background: '#f3f4f6',
          borderRadius: '4px',
          padding: '20px',
          textAlign: 'center',
          color: '#6b7280',
          minHeight: '350px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <p style={{ margin: 0 }}>No map configuration available for this dungeon</p>
        </div>
      ) : (
        <div style={{
          position: 'relative',
          width: `${mapWidth}px`,
          height: `${mapHeight}px`,
          background: '#1a1a1a',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          {/* Render dungeon map images */}
          {Object.entries(dungeonConfig.maps).map(([mapId, mapConfig]) => {
            const worldBounds = dungeonConfig.worldBounds;
            const mapBounds = mapConfig.bounds;

            // Calculate world dimensions
            const worldWidth = worldBounds.maxX - worldBounds.minX;
            const worldHeight = worldBounds.maxY - worldBounds.minY;

            // Calculate map dimensions in world coordinates
            const mapWorldWidth = mapBounds.maxX - mapBounds.minX;
            const mapWorldHeight = mapBounds.maxY - mapBounds.minY;

            // Calculate map position relative to world bounds (0-1 range)
            const relativeX = (mapBounds.minX - worldBounds.minX) / worldWidth;
            const relativeY = (mapBounds.minY - worldBounds.minY) / worldHeight;

            // Calculate map size relative to world (0-1 range)
            const relativeWidth = mapWorldWidth / worldWidth;
            const relativeHeight = mapWorldHeight / worldHeight;

            // Convert to pixel coordinates
            const pixelX = relativeX * mapWidth;
            // Invert Y-axis: flip position so higher Y values appear at top
            const pixelY = (1 - relativeY - relativeHeight) * mapHeight;
            const pixelWidth = relativeWidth * mapWidth;
            const pixelHeight = relativeHeight * mapHeight;

            return (
              <img
                key={mapId}
                src={mapConfig.image || '/assets/missing.png'}
                alt={`Map ${mapId}`}
                style={{
                  position: 'absolute',
                  left: `${pixelX}px`,
                  top: `${pixelY}px`,
                  width: `${pixelWidth}px`,
                  height: `${pixelHeight}px`,
                  objectFit: 'cover',
                  opacity: 0.7,
                  pointerEvents: 'none'
                }}
              />
            );
          })}

          {/* Render entities on top of maps */}
          {Object.values(currentSnapshot).map(entity => {
            const mapPos = worldToMap(entity.position, mapWidth, mapHeight);
            if (!mapPos) return null;

            if (entity.type === 'player') {
              return (
                <div
                  key={entity.id}
                  style={{
                    position: 'absolute',
                    left: `${mapPos.x}px`,
                    top: `${mapPos.y}px`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1
                  }}
                  title={entity.name}
                >
                  {entity.hero.icon ? (
                    <img
                      src={entity.hero.icon}
                      alt={entity.hero.name}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: `3px solid ${entity.hero.color}`,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                        background: '#000'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: entity.hero.color,
                      border: '3px solid #fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }} />
                  )}
                </div>
              );
            } else {
              return (
                <div
                  key={entity.id}
                  style={{
                    position: 'absolute',
                    left: `${mapPos.x}px`,
                    top: `${mapPos.y}px`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 2
                  }}
                  title={entity.name}
                >
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#ef4444',
                    border: '2px solid #fff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }} />
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
}
