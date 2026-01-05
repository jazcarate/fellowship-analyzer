import { useMemo } from 'preact/hooks';
import { useAnalysis } from '../../contexts/analysis-context';
import { getDungeonConfig, getWorldBounds } from '../../constants/maps';
import { type Position, type Hero, hasSource, hasTarget } from '../../types';
import { trackEffects, getEffectsAtTime } from '../../utils/effect-tracker';
import { TRACKED_BUFF_IDS } from '../../constants/effects';

interface PlayerEntity {
  type: 'player';
  id: string;
  name: string;
  hero: Hero;
  position: Position;
  currentHP: number;
  maxHP: number;
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
  const { hoveredTime, dungeon, player } = useAnalysis();

  const dungeonConfig = getDungeonConfig(dungeon.dungeonId);

  const allEffects = useMemo(() => {
    const { completedEffects } = trackEffects(dungeon, player);
    return completedEffects;
  }, [dungeon, player]);

  const spatialIndex = useMemo(() => {
    const duration = dungeon.endTime ? Math.ceil(dungeon.endTime) : 0;

    if (duration === 0) return [];

    const snapshots: SnapshotData[] = Array.from({ length: duration }, () => ({}));

    const getPlayer = (playerId: string) => dungeon.players.find(p => p.playerId === playerId)!;

    for (const event of dungeon.events) {
      const secondOffset = Math.floor(event.timestamp);
      if (secondOffset < 0 || secondOffset >= duration) continue;

      const snapshot = snapshots[secondOffset]!;

      if (hasSource(event)) {
        if (event.sourceId.startsWith("Player-")) {
          const sourcePlayer = getPlayer(event.sourceId);
          snapshot[event.sourceId] = {
            type: 'player',
            id: event.sourceId,
            name: sourcePlayer.playerName,
            hero: sourcePlayer.hero,
            position: event.sourcePosition,
            currentHP: event.sourceCurrentHP,
            maxHP: event.sourceMaxHP
          };
        } else if (event.sourceId.startsWith("Npc-")) {
          snapshot[event.sourceId] = {
            type: 'npc',
            id: event.sourceId,
            name: event.sourceName || 'Unknown',
            position: event.sourcePosition
          };
        }
      }

      if (hasTarget(event)) {
        if (event.targetId.startsWith("Player-")) {
          const targetPlayer = getPlayer(event.targetId);
          snapshot[event.targetId] = {
            type: 'player',
            id: event.targetId,
            name: targetPlayer.playerName,
            hero: targetPlayer.hero,
            position: event.targetPosition,
            currentHP: event.targetCurrentHP,
            maxHP: event.targetMaxHP
          };
        } else if (event.targetId.startsWith("Npc-")) {
          snapshot[event.targetId] = {
            type: 'npc',
            id: event.targetId,
            name: event.targetName || 'Unknown',
            position: event.targetPosition
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

    const bounds = getWorldBounds(dungeonConfig);
    const worldWidth = bounds.maxX - bounds.minX;
    const worldHeight = bounds.maxY - bounds.minY;

    if (worldWidth === 0 || worldHeight === 0) return null;

    const x = ((worldPos.x - bounds.minX) / worldWidth) * mapWidth;
    const y = (1 - (worldPos.y - bounds.minY) / worldHeight) * mapHeight;

    return { x, y };
  };

  const mapWidth = 350;
  const mapHeight = 350;

  const playerEntitiesAtTime = useMemo(() => {
    if (!hoveredTime) return [];

    return dungeon.players.map(player => {
      const entity = currentSnapshot[player.playerId] as PlayerEntity | undefined;

      const effects = getEffectsAtTime(allEffects, hoveredTime).filter(
        effect => {
          if (effect.targetId !== player.playerId) return false;
          // Show all debuffs, but only specific buffs
          if (effect.effectType === 'DEBUFF') return true;
          return TRACKED_BUFF_IDS.has(effect.effectId);
        }
      );

      return {
        type: 'player' as const,
        id: player.playerId,
        name: player.playerName,
        hero: player.hero,
        position: entity?.position || { x: 0, y: 0 },
        currentHP: entity?.currentHP || 0,
        maxHP: entity?.maxHP || 0,
        effects
      };
    });
  }, [currentSnapshot, allEffects, hoveredTime, dungeon.players]);

  const npcCountsAtTime = useMemo(() => {
    if (!hoveredTime) return new Map<string, number>();

    const npcCounts = new Map<string, number>();

    Object.values(currentSnapshot).forEach(entity => {
      if (entity.type === 'npc') {
        const count = npcCounts.get(entity.name) || 0;
        npcCounts.set(entity.name, count + 1);
      }
    });

    return npcCounts;
  }, [currentSnapshot, hoveredTime]);

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
            const worldBounds = getWorldBounds(dungeonConfig);
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

      {/* Player Health and Effects List */}
      {hoveredTime !== null && playerEntitiesAtTime.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
            Players
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {playerEntitiesAtTime.map(playerEntity => {
              const hpPercent = playerEntity.maxHP > 0
                ? (playerEntity.currentHP / playerEntity.maxHP) * 100
                : 0;

              return (
                <div
                  key={playerEntity.id}
                  style={{
                    background: 'var(--offwhite-color)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    {playerEntity.hero.icon && (
                      <img
                        src={playerEntity.hero.icon}
                        alt={playerEntity.hero.name}
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: `2px solid ${playerEntity.hero.color}`
                        }}
                      />
                    )}
                    <span style={{ fontSize: '13px', fontWeight: '600', flex: 1 }}>
                      {playerEntity.name}
                    </span>
                    {playerEntity.maxHP > 0 && (
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {Math.round(hpPercent)}%
                      </span>
                    )}
                  </div>

                  {playerEntity.maxHP > 0 && (
                    <div style={{
                      background: '#ddd',
                      height: '4px',
                      borderRadius: '2px',
                      overflow: 'hidden',
                      marginBottom: '6px'
                    }}>
                      <div style={{
                        background: hpPercent > 50 ? '#10b981' : hpPercent > 25 ? '#f59e0b' : '#ef4444',
                        height: '100%',
                        width: `${hpPercent}%`,
                        transition: 'width 0.2s'
                      }} />
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px',
                    minHeight: '20px'
                  }}>
                    {playerEntity.effects.map((effect, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '2px 6px',
                          borderRadius: '3px',
                          fontSize: '11px',
                          background: effect.effectType === 'BUFF' ? '#d1fae5' : '#fee2e2',
                          color: effect.effectType === 'BUFF' ? '#065f46' : '#991b1b',
                          border: `1px solid ${effect.effectType === 'BUFF' ? '#10b981' : '#ef4444'}`,
                          height: 'fit-content'
                        }}
                        title={effect.effectName}
                      >
                        {effect.effectType === 'BUFF' ? '↑' : '↓'} {effect.effectName}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Enemies List */}
      {hoveredTime !== null && npcCountsAtTime.size > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
            Enemies
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {Array.from(npcCountsAtTime.entries())
              .sort((a, b) => b[1] - a[1]) // Sort by count descending
              .map(([name, count]) => (
                <div
                  key={name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 8px',
                    background: 'var(--offwhite-color)',
                    borderRadius: '4px',
                    fontSize: '12px',
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <span style={{ color: 'var(--text-primary)' }}>{name}</span>
                  <span
                    style={{
                      color: 'var(--text-secondary)',
                      fontWeight: '600',
                      fontSize: '11px'
                    }}
                  >
                    ×{count}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
