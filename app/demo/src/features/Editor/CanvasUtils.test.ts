import { describe, test, expect } from "vitest";

import { distanceToLine, distanceToRect } from "./CanvasUtils";

describe("Canvas Utils", () => {
  describe("distanceToLine", () => {
    /**
     * inner point
     *
     * |           |
     * |   inner   |
     * |   point   |
     * |           |
     * from ------ to
     */
    test("returns the distance from inner point", () => {
      const point = { x: 0, y: 0 };
      const line = [
        { x: 0, y: 1 },
        { x: 1, y: 0 },
      ] as [
        {
          x: number;
          y: number;
        },
        {
          x: number;
          y: number;
        }
      ];

      const result = distanceToLine(point, line);

      expect(result).toBeCloseTo(Math.pow(2, 1 / 2) / 2);
    });

    /**
     * outer point
     *
     *      |       |
     * outer|       |outer
     * point|       |point
     *      |       |
     *      from -- to
     */
    test("returns the distance of point outer", () => {
      const point = {
        x: 0,
        y: 1,
      };

      const line = [
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ] as [
        {
          x: number;
          y: number;
        },
        {
          x: number;
          y: number;
        }
      ];

      const result = distanceToLine(point, line);

      expect(result).toBeCloseTo(Math.pow(2, 1 / 2));
    });
  });

  describe("distanceToRect", () => {
    test("returns the distance between a point and a rectangle", () => {
      const point = { x: 0.5, y: 0.5 };
      const rect = {
        x: 0,
        y: 0,
        width: 1,
        height: 1,
      };

      const result = distanceToRect(point, rect);

      expect(result).toBeCloseTo(0.5);
    });

    test("outer point distance", () => {
      const point = { x: 0, y: 0 };
      const rect = {
        x: 1,
        y: 1,
        width: 1,
        height: 1,
      };

      const result = distanceToRect(point, rect);

      expect(result).toBeCloseTo(Math.pow(2, 1 / 2));
    });
  });
});
