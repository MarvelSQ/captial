import { useEffect, useState } from "react";
import * as core from "@marvelsq/lc-core";
import reactLogo from "./assets/react.svg";
import "./App.css";
import Paint from "./features/Editor/Paint";

function App() {
  const [expend, setExpend] = useState(false);

  useEffect(() => {
    core.createServer("test");
  });

  return (
    <>
      <aside
        className={`fixed top-3 bottom-3 flex flex-col items-stretch gap-2 border rounded-r-md pt-2 transition-all bg-white ${
          expend ? "w-60" : "w-12"
        }`}
      >
        <div
          className={`text-blue-500 text-lg text-center font-bold rounded-md min-w-max p-2 bg-slate-50 ${
            expend ? "" : "shadow-sm"
          }`}
        >
          Capital
        </div>
        <div className="flex-grow overflow-auto flex flex-col gap-2">
          {Array(100)
            .fill(0)
            .map((_, i) => (
              <div
                className={`shrink-0 mr-2 ml-2 whitespace-nowrap cursor-pointer ${
                  expend
                    ? ""
                    : " w-7 overflow-hidden border rounded-md first-letter:text-lg first-letter:font-bold first-letter:p-2 first-letter:border "
                }`}
                key={i}
                onMouseDown={(event) => {
                  event.stopPropagation();
                  event.preventDefault();

                  const node = event.target;

                  const copyNode = (node as HTMLElement).cloneNode(
                    true
                  ) as HTMLElement;
                  const rect = (node as HTMLElement).getBoundingClientRect();
                  document.body.appendChild(copyNode);

                  copyNode.style.position = "absolute";
                  copyNode.style.top = `${rect.top}px`;
                  copyNode.style.left = `${rect.left}px`;
                  copyNode.style.width = `${rect.width}px`;
                  copyNode.style.height = `${rect.height}px`;

                  const nodeMouseOffsetY = event.clientY - rect.top;
                  const nodeMouseOffsetX = event.clientX - rect.left;

                  const listenMouseMove = (event: MouseEvent) => {
                    requestAnimationFrame(() => {
                      copyNode.style.top = `${
                        event.clientY - nodeMouseOffsetY
                      }px`;
                      copyNode.style.left = `${
                        event.clientX - nodeMouseOffsetX
                      }px`;
                    });
                  };

                  window.addEventListener("mousemove", listenMouseMove);

                  window.addEventListener("mouseup", (event) => {
                    window.removeEventListener("mousemove", listenMouseMove);

                    copyNode.remove();
                  });
                }}
              >
                SelectPicker {i}
              </div>
            ))}
        </div>
        <button
          className="text-center whitespace-nowrap first-letter:font-bold"
          onClick={() => {
            setExpend(!expend);
          }}
        >
          {expend ? "< shrink" : "> expend"}
        </button>
      </aside>
      <div className="h-full flex justify-evenly p-20 flex-col">
        <Paint />
      </div>
    </>
  );
}

export default App;
