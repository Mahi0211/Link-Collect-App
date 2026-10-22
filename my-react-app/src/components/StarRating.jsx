import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { themes } from '../utils/themes';

export const StarRating = ({
  rating = 0,
  onRate,
  readOnly = false,
  size = 16,
  showScore = false,
  theme = 'dark'
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const colors = themes[theme] || themes.dark;

  const activeStars = hoverRating || rating;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
      }}
      onMouseLeave={() => !readOnly && setHoverRating(0)}
    >
      {[1, 2, 3, 4, 5].map((starValue) => {
        const isFilled = starValue <= activeStars;
        const isHovered = hoverRating === starValue;

        return (
          <button
            key={starValue}
            type="button"
            disabled={readOnly}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!readOnly && onRate) {
                // If clicking current rating, toggle back or keep
                onRate(starValue === rating ? 0 : starValue);
              }
            }}
            onMouseEnter={() => !readOnly && setHoverRating(starValue)}
            style={{
              background: 'none',
              border: 'none',
              padding: '1px',
              cursor: readOnly ? 'default' : 'pointer',
              color: isFilled ? colors.rating : colors.textTertiary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              transform: isHovered ? 'scale(1.25)' : 'scale(1)',
              outline: 'none',
            }}
            title={readOnly ? `${rating} of 5 stars` : `Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
          >
            <Star
              size={size}
              fill={isFilled ? colors.rating : 'transparent'}
              strokeWidth={isFilled ? 0 : 1.5}
              style={{
                filter: isFilled ? `drop-shadow(0 0 3px ${colors.rating}60)` : 'none',
                transition: 'all 0.15s ease',
              }}
            />
          </button>
        );
      })}

      {showScore && rating > 0 && (
        <span
          style={{
            marginLeft: '5px',
            fontSize: '11px',
            fontWeight: '600',
            color: colors.rating,
          }}
        >
          {rating}.0
        </span>
      )}
    </div>
  );
};
