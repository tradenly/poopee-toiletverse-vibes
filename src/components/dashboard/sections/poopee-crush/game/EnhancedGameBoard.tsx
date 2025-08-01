
import React from "react";
import { TileType } from "./EnhancedTileTypes";
import { AnimationEvent } from "./EnhancedGameEngine";
import { useIsMobile } from "@/hooks/use-mobile";

interface EnhancedGameBoardProps {
  board: TileType[][];
  onTileClick: (row: number, col: number) => void;
  selectedTile: {row: number, col: number} | null;
  hintTiles: {row: number, col: number}[];
  animations: AnimationEvent[];
}

export const EnhancedGameBoard = ({ 
  board, 
  onTileClick, 
  selectedTile, 
  hintTiles, 
  animations
}: EnhancedGameBoardProps) => {
  const isMobile = useIsMobile();

  const getTileEmoji = (tile: TileType): string => {
    switch (tile) {
      case TileType.POOP: return "💩";
      case TileType.TOILET: return "🚽";
      case TileType.TOILET_PAPER: return "🧻";
      case TileType.FART: return "💨";
      case TileType.BANANA: return "🍌";
      case TileType.BELL: return "🔔";
      case TileType.STRIPED_HORIZONTAL: return "💩⚡";
      case TileType.STRIPED_VERTICAL: return "💩⬆️";
      case TileType.WRAPPED: return "💩💥";
      case TileType.COLOR_BOMB: return "💩🌈";
      case TileType.BLOCKED: return "🚫";
      case TileType.EMPTY: return "";
      default: return "💩";
    }
  };

  const getTileClassName = (row: number, col: number, tile: TileType): string => {
    // Adjust tile size based on mobile/desktop
    const baseSize = isMobile ? "w-10 h-10" : "w-12 h-12";
    const textSize = isMobile ? "text-xl" : "text-2xl";
    
    let className = `${baseSize} flex items-center justify-center ${textSize} rounded-lg border-2 cursor-pointer transition-all duration-200 `;
    
    if (selectedTile && selectedTile.row === row && selectedTile.col === col) {
      className += "border-yellow-400 bg-yellow-900/50 shadow-lg shadow-yellow-500/50 ";
    } else if (hintTiles.some(hint => hint.row === row && hint.col === col)) {
      className += "border-green-400 bg-green-900/30 animate-pulse ";
    } else if (tile === TileType.BLOCKED) {
      className += "border-gray-600 bg-gray-800 cursor-not-allowed ";
    } else if (tile === TileType.EMPTY) {
      className += "border-gray-700 bg-gray-900/30 cursor-default ";
    } else {
      className += "border-gray-600 bg-gray-800/50 hover:bg-gray-700/50 hover:border-gray-500 ";
    }
    
    // Add special tile effects
    if (tile === TileType.STRIPED_HORIZONTAL || tile === TileType.STRIPED_VERTICAL) {
      className += "shadow-lg shadow-blue-500/30 ";
    } else if (tile === TileType.WRAPPED) {
      className += "shadow-lg shadow-purple-500/30 ";
    } else if (tile === TileType.COLOR_BOMB) {
      className += "shadow-lg shadow-rainbow animate-pulse ";
    }
    
    return className;
  };

  const handleTileClick = (row: number, col: number) => {
    const tile = board[row][col];
    
    // Prevent clicks on blocked or empty tiles
    if (tile === TileType.BLOCKED || tile === TileType.EMPTY) {
      return;
    }
    
    // Normal tile click
    onTileClick(row, col);
  };

  // Simplified animation classes - only show active animations
  const getAnimationClasses = (row: number, col: number): string => {
    if (!animations || animations.length === 0) return "";
    
    const relevantAnimations = animations.filter(anim => {
      if (!anim.tiles) return false;
      return anim.tiles.some(tile => tile.row === row && tile.col === col);
    });
    
    if (relevantAnimations.length === 0) return "";
    
    // Only apply the most recent animation to prevent conflicts
    const latestAnimation = relevantAnimations[relevantAnimations.length - 1];
    
    switch (latestAnimation.type) {
      case 'match':
        return "animate-ping ";
      case 'drop':
        return "animate-bounce ";
      case 'invalid':
        return "animate-pulse ";
      default:
        return "";
    }
  };

  // Ensure board exists and has proper dimensions
  if (!board || board.length === 0 || !board[0] || board[0].length === 0) {
    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="bg-gray-900/30 rounded-lg border border-gray-700 p-8">
          <div className="text-white text-center">Loading game board...</div>
        </div>
      </div>
    );
  }

  // Adjust grid gap and padding based on mobile/desktop
  const gridGap = isMobile ? "gap-2" : "gap-1";
  const containerPadding = isMobile ? "p-2" : "p-4";

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className={`grid grid-cols-8 ${gridGap} ${containerPadding} bg-gray-900/30 rounded-lg border border-gray-700`}>
        {board.map((row, rowIndex) =>
          row.map((tile, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`${getTileClassName(rowIndex, colIndex, tile)} ${getAnimationClasses(rowIndex, colIndex)}`}
              onClick={() => handleTileClick(rowIndex, colIndex)}
              title={`Row ${rowIndex + 1}, Col ${colIndex + 1}`}
            >
              {getTileEmoji(tile)}
            </div>
          ))
        )}
      </div>
      
      {animations && animations.length > 0 && (
        <div className="text-xs text-gray-400 text-center">
          {animations.map(anim => (
            <div key={anim.id}>
              {anim.type === 'cascade' && `🔄 Cascade x${anim.cascadeMultiplier?.toFixed(1) || 1}`}
              {anim.type === 'match' && `✨ Match found!`}
              {anim.type === 'invalid' && `❌ Invalid move`}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
