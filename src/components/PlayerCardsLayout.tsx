import React, { useEffect, useRef } from 'react';

interface PlayerCardsLayoutItem {
  id: string;
  node: React.ReactNode;
}

interface PlayerCardsLayoutProps {
  layoutId: string;
  items: PlayerCardsLayoutItem[];
  activePlayerId?: string;
  focusKey?: string | number;
  enableAutoFocus?: boolean;
}

const EDGE_ORDER = ['bottom', 'right', 'top', 'left'] as const;
type Edge = (typeof EDGE_ORDER)[number];

const getEdgeForIndex = (index: number): Edge => {
  return EDGE_ORDER[index % EDGE_ORDER.length];
};

export const PlayerCardsLayout: React.FC<PlayerCardsLayoutProps> = ({
  layoutId,
  items,
  activePlayerId,
  focusKey,
  enableAutoFocus = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enableAutoFocus || !activePlayerId) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const activeElement = Array.from(
      container.querySelectorAll<HTMLElement>('[data-player-card-id]')
    ).find((element) => element.dataset.playerCardId === activePlayerId);

    if (!activeElement) {
      return;
    }

    requestAnimationFrame(() => {
      activeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });

      activeElement.focus({ preventScroll: true });
    });
  }, [activePlayerId, focusKey, enableAutoFocus, layoutId]);

  const renderCardTarget = (item: PlayerCardsLayoutItem, className: string) => {
    const isActive = item.id === activePlayerId;
    return (
      <div
        key={item.id}
        className={`${className} ${isActive ? 'player-layout-active-target' : ''}`.trim()}
        data-player-card-id={item.id}
        tabIndex={-1}
      >
        {item.node}
      </div>
    );
  };

  if (layoutId === 'seatRail') {
    return (
        <div className="player-layout-seat-rail" ref={containerRef}>
          {items.map((item) => (
            renderCardTarget(item, 'player-layout-seat-rail-item card-button')
          ))}
        </div>
      );
  }

  if (layoutId === 'minimalist') {
    return (
      <div className="player-layout-scroll" aria-label="Player cards" ref={containerRef}>
        {items.map((item) => (
          renderCardTarget(item, 'player-layout-scroll-item card-button')
        ))}
      </div>
    );
  }

  if (layoutId !== 'tabletop' && layoutId !== 'tabletopRotated') {
    return (
      <div className="tabletop-grid" ref={containerRef}>
        {items.map((item) => (
          renderCardTarget(item, 'card-button')
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
            <div
              key={item.id}
              className={`player-layout-card-wrap ${rotatedSideClass} ${item.id === activePlayerId ? 'player-layout-active-target' : ''}`.trim()}
              data-player-card-id={item.id}
              tabIndex={-1}
            >
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
    <div className="player-layout-table" ref={containerRef}>
      {renderSide('top', buckets.top)}
      {renderSide('left', buckets.left)}
      {renderSide('right', buckets.right)}
      {renderSide('bottom', buckets.bottom)}
    </div>
  );
};
