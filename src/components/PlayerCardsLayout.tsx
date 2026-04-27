import React from 'react';

interface PlayerCardsLayoutItem {
  id: string;
  node: React.ReactNode;
}

interface PlayerCardsLayoutProps {
  layoutId: string;
  items: PlayerCardsLayoutItem[];
}

const EDGE_ORDER = ['bottom', 'right', 'top', 'left'] as const;
type Edge = (typeof EDGE_ORDER)[number];

const getEdgeForIndex = (index: number, total: number): Edge => {
  if (total <= EDGE_ORDER.length) {
    return EDGE_ORDER[index % EDGE_ORDER.length];
  }
  return EDGE_ORDER[index % EDGE_ORDER.length];
};

const getRotationForPosition = (position: number): number => {
  const rotations = [0, 90, 180, 270];
  return rotations[position % 4];
};

export const PlayerCardsLayout: React.FC<PlayerCardsLayoutProps> = ({ layoutId, items }) => {
  if (layoutId === 'minimalist') {
    return (
      <div className="player-layout-minimalist">
        {items.map((item) => (
          <div key={item.id} className="player-layout-minimalist-card card-button">
            {item.node}
          </div>
        ))}
      </div>
    );
  }

  if (layoutId !== 'tabletop' && layoutId !== 'tabletopRotated') {
    return (
      <div className="tabletop-grid">
        {items.map((item) => (
          <div key={item.id} className="card-button">
            {item.node}
          </div>
        ))}
      </div>
    );
  }

  const buckets: Record<Edge, Array<PlayerCardsLayoutItem & { position: number }>> = {
    top: [],
    right: [],
    bottom: [],
    left: [],
  };

  items.forEach((item, index) => {
    const edge = getEdgeForIndex(index, items.length);
    buckets[edge].push({ ...item, position: index });
  });

  const renderSide = (side: Edge, sideItems: Array<PlayerCardsLayoutItem & { position: number }>) => {
    return (
      <div className="player-layout-side player-layout-side-top" key={`side-${side}`} data-side={side}>
        {sideItems.map((item) => {
          const rotation = layoutId === 'tabletopRotated' ? getRotationForPosition(item.position) : 0;
          return (
            <div
              key={item.id}
              className="player-layout-card-wrap card-button"
              style={rotation > 0 ? { transform: `rotate(${rotation}deg)` } : undefined}
            >
              {item.node}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="player-layout-table">
      {renderSide('top', buckets.top)}
      {renderSide('left', buckets.left)}
      <div className="player-layout-center" aria-hidden>
        <div className="player-layout-center-mark">TABLE</div>
      </div>
      {renderSide('right', buckets.right)}
      {renderSide('bottom', buckets.bottom)}
    </div>
  );
};
