import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { distanceToMultiLines, distanceToRect } from "./CanvasUtils";

type Shape =
  | {
      shape: "rect";
      location: {
        x: number;
        y: number;
      };
      width: number;
      height: number;
    }
  | {
      shape: "path";
      points: [x: number, y: number][];
    };

function isPointInRect(
  point: { x: number; y: number },
  rect: [x: number, y: number, width: number, height: number]
) {
  return (
    point.x >= rect[0] &&
    point.x <= rect[0] + rect[2] &&
    point.y >= rect[1] &&
    point.y <= rect[1] + rect[3]
  );
}

function Paint() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const [tool, setTool] = useState<"pen" | "move" | "rect" | "select">("pen");

  useLayoutEffect(() => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const radio = window.devicePixelRatio;
      canvasRef.current.style.width = `${rect.width}px`;
      canvasRef.current.style.height = `${rect.height}px`;
      /**
       * 修复触控屏拖动时，页面滚动的问题
       */
      canvasRef.current.style.touchAction = "none";
      canvasRef.current.width = rect.width * radio;
      canvasRef.current.height = rect.height * radio;

      renderingObj.current.border.right = rect.width * radio;
      renderingObj.current.border.bottom = rect.height * radio;
    }
  }, []);

  const currentToolRef = useRef(tool);

  currentToolRef.current = useMemo(() => tool, [tool]);

  const renderingObj = useRef({
    objs: [] as Shape[],
    border: {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
    },
  });

  const handleDown = useCallback((startPoint: { x: number; y: number }) => {
    const canvas = canvasRef.current;

    if (canvas) {
      const paint = canvas.getContext("2d");
      const rect = canvas.getBoundingClientRect();
      const { width, height } = canvas;
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;

      function getTranslate(): { x: number; y: number } | void {
        const transforms = paint?.getTransform();
        if (transforms) {
          return {
            x: transforms.e,
            y: transforms.f,
          };
        }
      }

      const translate = getTranslate();

      function onNewPoint(point: { x: number; y: number }) {
        const { x, y } = point;

        renderingObj.current.border.top = Math.min(
          renderingObj.current.border.top,
          y
        );

        renderingObj.current.border.left = Math.min(
          renderingObj.current.border.left,
          x
        );

        renderingObj.current.border.right = Math.max(
          renderingObj.current.border.right,
          x
        );

        renderingObj.current.border.bottom = Math.max(
          renderingObj.current.border.bottom,
          y
        );
      }

      function rerenderObj(highlight?: number) {
        const { border } = renderingObj.current;
        const safeRange = 100;
        paint?.clearRect(
          border.left - safeRange,
          border.top - safeRange,
          border.right - border.left + safeRange * 2,
          border.bottom - border.top + safeRange * 2
        );

        renderingObj.current.objs.forEach((shape, index) => {
          if (index === highlight) {
            paint && (paint.strokeStyle = "red");
          } else {
            paint && (paint.strokeStyle = "black");
          }
          if (shape.shape === "path") {
            paint?.beginPath();
            const paths = shape.points;
            paths.forEach(([x, y], index) => {
              if (index === 0) {
                paint?.moveTo(x, y);
              } else {
                paint?.lineTo(x, y);
              }
            });
            paint?.stroke();
          } else if (shape.shape === "rect") {
            paint?.strokeRect(
              shape.location.x,
              shape.location.y,
              shape.width,
              shape.height
            );
          }
        });
      }

      if (currentToolRef.current === "pen") {
        const inPaintX =
          (startPoint.x - rect.left) * scaleX - (translate?.x || 0);
        const inPaintY =
          (startPoint.y - rect.top) * scaleY - (translate?.y || 0);

        paint?.moveTo(inPaintX, inPaintY);

        const paths = [[inPaintX, inPaintY] as [x: number, y: number]];

        onNewPoint({ x: inPaintX, y: inPaintY });

        function listener(event: MouseEvent | TouchEvent) {
          event.stopPropagation();
          event.preventDefault();

          console.log("mouse move");

          const point = "touches" in event ? event.touches[0] : event;

          requestAnimationFrame(() => {
            const currentInPaintX =
              (point.clientX - rect.left) * scaleX - (translate?.x || 0);
            const currentInPaintY =
              (point.clientY - rect.top) * scaleY - (translate?.y || 0);

            paint?.lineTo(currentInPaintX, currentInPaintY);
            const lastPoint = paths[paths.length - 1];
            if (
              lastPoint[0] !== currentInPaintX ||
              lastPoint[1] !== currentInPaintY
            ) {
              paths.push([currentInPaintX, currentInPaintY]);
            }
            paint?.stroke();

            onNewPoint({ x: currentInPaintX, y: currentInPaintY });
          });
        }

        function removeListener() {
          renderingObj.current.objs.push({
            shape: "path",
            points: paths,
          });
          window.removeEventListener("mousemove", listener);
          window.removeEventListener("touchmove", listener);
          window.removeEventListener("mouseup", removeListener);
          window.removeEventListener("touchend", removeListener);
        }

        window.addEventListener("mousemove", listener);
        window.addEventListener("touchmove", listener);
        window.addEventListener("mouseup", removeListener);
        window.addEventListener("touchend", removeListener);
      } else if (currentToolRef.current === "move") {
        const startX = startPoint.x;
        const startY = startPoint.y;

        let lastX = startX;
        let lastY = startY;

        function listener(event: MouseEvent) {
          const { clientX, clientY } = event;

          paint?.translate(
            (clientX - lastX) * scaleX,
            (clientY - lastY) * scaleY
          );
          lastX = clientX;
          lastY = clientY;

          requestAnimationFrame(() => {
            rerenderObj();
          });
        }

        function removeListener() {
          window.removeEventListener("mousemove", listener);
          window.removeEventListener("mouseup", removeListener);
        }

        window.addEventListener("mousemove", listener);
        window.addEventListener("mouseup", removeListener);
      } else if (currentToolRef.current === "rect") {
        const inPaintX =
          (startPoint.x - rect.left) * scaleX - (translate?.x || 0);
        const inPaintY =
          (startPoint.y - rect.top) * scaleY - (translate?.y || 0);

        paint?.moveTo(inPaintX, inPaintY);

        const startX = startPoint.x;
        const startY = startPoint.y;

        onNewPoint({ x: inPaintX, y: inPaintY });

        let lastWidth = 0;
        let lastHeight = 0;

        function renderRect(event: MouseEvent) {
          requestAnimationFrame(() => {
            rerenderObj();

            const width = (event.clientX - startX) * scaleX;
            const height = (event.clientY - startY) * scaleY;

            lastWidth = width;
            lastHeight = height;

            paint?.strokeRect(inPaintX, inPaintY, width, height);
          });
        }

        function removeListener() {
          renderingObj.current.objs.push({
            shape: "rect",
            location: {
              x: inPaintX,
              y: inPaintY,
            },
            width: lastWidth,
            height: lastHeight,
          });

          onNewPoint({
            x: inPaintX + lastWidth,
            y: inPaintY + lastHeight,
          });

          window.removeEventListener("mousemove", renderRect);
          window.removeEventListener("mouseup", removeListener);
        }

        window.addEventListener("mousemove", renderRect);
        window.addEventListener("mouseup", removeListener);
      } else if (currentToolRef.current === "select") {
        /**
         * 点击位置周围的矩形
         */
        const offset = 10;

        const inPaintX =
          (startPoint.x - rect.left) * scaleX - (translate?.x || 0);
        const inPaintY =
          (startPoint.y - rect.top) * scaleY - (translate?.y || 0);

        function getClosestShapeIndex() {
          const shapes = renderingObj.current.objs;

          let closestShapeIndex = -1;
          let closestDistance = Infinity;

          shapes.forEach((shape, index) => {
            if (shape.shape === "rect") {
              const { x, y } = shape.location;
              const { width, height } = shape;

              const distance = distanceToRect(
                {
                  x: inPaintX,
                  y: inPaintY,
                },
                {
                  x,
                  y,
                  width,
                  height,
                }
              );

              console.log("rect[", index, "]", distance);

              if (distance < offset && distance < closestDistance) {
                closestDistance = distance;
                closestShapeIndex = index;
              }
            } else if (shape.shape === "path") {
              const paths = shape.points;

              const distance = distanceToMultiLines(
                {
                  x: inPaintX,
                  y: inPaintY,
                },
                paths.map(([x, y]) => ({ x, y }))
              );

              console.log("path[", index, "]", distance);

              if (distance < offset) {
                if (distance < closestDistance) {
                  closestDistance = distance;
                  closestShapeIndex = index;
                }
              }
            }
          });

          return closestShapeIndex;
        }

        const closestShapeIndex = getClosestShapeIndex();

        rerenderObj(closestShapeIndex === -1 ? undefined : closestShapeIndex);
      }
    }
  }, []);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    handleDown({
      x: event.clientX,
      y: event.clientY,
    });
  }, []);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const { touches } = event;
    handleDown({
      x: touches[0].clientX,
      y: touches[0].clientY,
    });
  }, []);

  return (
    <>
      <div className="flex gap-2">
        <button
          className={tool === "pen" ? "bg-blue-400 text-white" : ""}
          onClick={() => {
            setTool("pen");
          }}
        >
          pen
        </button>
        <button
          className={tool === "move" ? "bg-blue-400 text-white" : ""}
          onClick={() => {
            setTool("move");
          }}
        >
          move
        </button>
        <button
          className={tool === "rect" ? "bg-blue-400 text-white" : ""}
          onClick={() => {
            setTool("rect");
          }}
        >
          rect
        </button>
        <button
          className={tool === "select" ? "bg-blue-400 text-white" : ""}
          onClick={() => {
            setTool("select");
          }}
        >
          select
        </button>
      </div>
      <canvas
        className={`flex-shrink border ${
          tool === "pen" ? "cursor-crosshair" : "cursor-move"
        }`}
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      ></canvas>
    </>
  );
}

export default Paint;
