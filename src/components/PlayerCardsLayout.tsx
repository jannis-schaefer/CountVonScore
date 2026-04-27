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

export const PlayerCardsLayout: React.FC<PlayerCardsLayoutProps> = ({ layoutId, items }) => {
  if (layoutId !== 'tabletop') {
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
    buckets[getEdgeForIndex(index, items.length)].push(item);
  });

  return (
    <div className="player-layout-table">
      <div className="player-layout-side player-layout-side-top">
        {buckets.top.map((item) => (
          <div key={item.id} className="player-layout-card-wrap card-button">
            {item.node}
          </div>
        ))}
      </div>

      <div className="player-layout-side player-layout-side-left">
        {buckets.left.map((item) => (
          <div key={item.id} className="player-layout-card-wrap card-button">
            {item.node}
          </div>
        ))}
      </div>

      <div className="player-layout-center" aria-hidden>
        <div className="player-layout-center-mark">TABLE</div>
      </div>

      <div className="player-layout-side player-layout-side-right">
        {buckets.right.map((item) => (
          <div key={item.id} className="player-layout-card-wrap card-button">
            {item.node}
          </div>
        ))}
      </div>

      <div className="player-layout-side player-layout-side-bottom">
        {buckets.bottom.map((item) => (
          <div key={item.id} className="player-layout-card-wrap card-button">
            {item.node}
          </div>
        ))}
      </div>
    </div>
  );
};
