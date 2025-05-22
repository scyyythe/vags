import React from "react";

interface PencilProps {
  className?: string;
  size?: number;
}

export const Pencil: React.FC<PencilProps> = ({
  className = "",
  size = 24
}) => {
  return (
    <i className='bx bx-pencil text-xs'></i>
  );
};
