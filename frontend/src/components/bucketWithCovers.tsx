import bucket from "../assets/bucket.png";
import { useEffect, useRef } from "react";
import { getMovies } from "../connections/internal/movie.ts";
import { Bodies, Composite, Engine, Events, Render, Runner } from "matter-js";
import "./bucketWithCovers.css";

export function BucketWithCovers() {
  const canvas = useRef<HTMLDivElement>(null);
  const engine = useRef<Engine>(Engine.create());
  const render = useRef<Render>();
  const runner = useRef<Runner>(Runner.create());

  useEffect(() => {
    const covers: string[] = [];
    getMovies({ random: true, watched: false, limit: 20 })
      .then((movies) => {
        if (movies) {
          for (const movie of movies) {
            covers.push(movie["cover_link"]);
          }
        }
        coversRender(covers);
      })
      .catch((error) => {
        console.error("Error fetching random covers:", error);
      });
    return () => {
      clearRenderer();
    };
  });

  function coversRender(covers: string[]) {
    if (!canvas.current) return;
    clearRenderer();

    const container_width = 450;
    const container_height = 500;

    render.current = Render.create({
      element: canvas.current,
      engine: engine.current,
      options: {
        width: container_width,
        height: container_height,
        showAngleIndicator: false,
        wireframes: false,
        background: "transparent",
        wireframeBackground: "transparent",
      },
    });

    const offset = 10,
      options = {
        isStatic: true,
        render: {
          fillStyle: "transparent",
          strokeStyle: "transparent",
        },
      };

    Composite.add(engine.current.world, [
      Bodies.rectangle(
        container_height / 2,
        -offset,
        container_width + 2 * offset,
        50.5,
        options,
      ),
      Bodies.rectangle(
        container_height / 2,
        container_height + offset,
        container_width + 2 * offset,
        50.5,
        options,
      ),
      Bodies.rectangle(
        container_width + offset,
        container_width / 2,
        50.5,
        container_height + 2 * offset,
        options,
      ),
      Bodies.rectangle(
        -offset,
        container_width / 2,
        50.5,
        container_height + 2 * offset,
        options,
      ),
    ]);

    for (const cover of covers) {
      Composite.add(
        engine.current.world,
        Bodies.rectangle(Math.random() * 200, Math.random() * 200, 30, 45, {
          render: {
            sprite: {
              xScale: 0.1,
              yScale: 0.1,
              texture: cover,
            },
          },
        }),
      );
    }

    engine.current.timing.timeScale = 0.05;
    engine.current.gravity.scale = 0.03;

    Events.on(engine.current, "beforeUpdate", function () {
      engine.current.gravity.x = Math.cos(
        engine.current.timing.timestamp * 0.006,
      );
      engine.current.gravity.y = Math.sin(
        engine.current.timing.timestamp * 0.006,
      );
    });
    Render.run(render.current);
    Runner.run(runner.current, engine.current);
  }

  function clearRenderer() {
    if (!render.current) return;
    Render.stop(render.current);
    Runner.stop(runner.current);
    render.current.canvas.remove();

    if (!engine.current) return;
    Composite.clear(engine.current.world, true, true);
    Engine.clear(engine.current);
  }

  return (
    <>
      <div className={"bucketAnimation"}>
        <img className={"bucket"} alt={"bucket"} src={bucket} />
        <div ref={canvas} className={"renderContainer"}></div>
      </div>
    </>
  );
}
