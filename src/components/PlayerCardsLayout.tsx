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

const getEdgeForIndex = (index: number): Edge => {
  return EDGE_ORDER[index % EDGE_ORDER.length];
};

export const PlayerCardsLayout: React.FC<PlayerCardsLayoutProps> = ({ layoutId, items }) => {
  if (layoutId === 'minimalist') {
    return (
      <div className="player-layout-scroll" aria-label="Player cards">
        {items.map((item) => (
          <section key={item.id} className="player-layout-scroll-item card-button">
            {item.node}
          </section>
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

  const buckets: Record<Edge, PlayerCardsLayoutItem[]> = {
    top: [],
    right: [],
    bottom: [],
    left: [],
  };

  items.forEach((item, index) => {
    buckets[getEdgeForIndex(index)].push(item);
  });

  const isRotated = layoutId === 'tabletopRotated';

  const renderSide = (side: Edge, sideItems: PlayerCardsLayoutItem[]) => {
    return (
      <div className={`player-layout-side player-layout-side-${side}`} key={`side-${side}`}>
        {sideItems.map((item) => {
          const rotateClass = isRotated ? `player-layout-rotate player-layout-rotate-${side}` : '';
          const rotatedSideClass = isRotated && (side === 'left' || side === 'right')
            ? 'player-layout-card-wrap-rotated-side'
            : '';

          return (
            <div key={item.id} className={`player-layout-card-wrap ${rotatedSideClass}`.trim()}>
              {isRotated ? (
                <div className={rotateClass}>
                  {item.node}
                </div>
              ) : (
                item.node
              )}
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
      {renderSide('right', buckets.right)}
      {renderSide('bottom', buckets.bottom)}
    </div>
  );
};
