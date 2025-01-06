import bucket from "../assets/bucket.png";
import { useEffect, useRef } from "react";
import { getMovies } from "../connections/internal/movie.ts";
import { Bodies, Body, Composite, Engine, Events, Render, Runner } from "matter-js";
import "./bucketWithCovers.css";

export function BucketWithCovers() {
  const canvas = useRef<HTMLDivElement>(null);
  const engine = useRef<Engine>(Engine.create());
  const render = useRef<Render>();
  const runner = useRef<Runner>(Runner.create());

  const offset = 20;
  const renderOptions = {
      strokeStyle: "transparent",
  };

  let canvasWidth = window.innerWidth / 5;
  let previousCanvasWidth = window.innerWidth / 5;
  let canvasHeight = window.innerHeight / 3;
  let previousCanvasHeight = window.innerHeight / 3;
  let currentScaleX = window.innerWidth / canvasWidth;
  let currentScaleY = window.innerHeight / canvasHeight;

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

    render.current = Render.create({
      element: canvas.current,
      engine: engine.current,
      options: {
        width: canvasWidth,
        height: canvasHeight,
        showAngleIndicator: false,
        wireframes: false,
        background: "transparent",
        wireframeBackground: "transparent",
        pixelRatio: window.devicePixelRatio,
      },
    });



    Composite.add(engine.current.world, [
      Bodies.rectangle(
        canvasHeight / 2,
        offset,
        canvasWidth + 2 * offset,
        50.5,
        {isStatic: true,
          label: "top",
          render: renderOptions,},
      ),
      Bodies.rectangle(
        canvasHeight / 2,
        canvasHeight - offset,
        canvasWidth + 2 * offset,
        50.5,
        {isStatic: true,
          label: "bottom",
          render: renderOptions,},
      ),
      Bodies.rectangle(
        canvasWidth - offset,
        canvasWidth / 2,
        50.5,
        canvasHeight + 2 * offset,
        {isStatic: true,
          label: "right",
          angle: -3,
          render: renderOptions,}
      ),
      Bodies.rectangle(
        offset,
        canvasWidth / 2,
        50.5,
        canvasHeight + 2 * offset,
        {isStatic: true,
          label: "left",
          angle: 3,
          render: renderOptions,}
      ),
    ]);

    for (const cover of covers) {
      const width = 30;
      const height = 45;
      Composite.add(
        engine.current.world,
        Bodies.rectangle(
          Math.random() * (canvasWidth - 2 * offset) + offset + width / 2,
          Math.random() * (canvasHeight - 2 * offset) + offset + height / 2,
          width,
          height,
          {
            friction: 0.3,
            restitution: 0.3,
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

      engine.current.world.bodies.forEach((body) => {
        if (!body.isStatic) {
          const { x, y } = body.position;
          const halfWidth = body.bounds.max.x - body.bounds.min.x;
          const halfHeight = body.bounds.max.y - body.bounds.min.y;

          if (x - halfWidth < 0) Body.setPosition(body, { x: halfWidth, y });
          if (x + halfWidth > canvasWidth)
            Body.setPosition(body, { x: canvasWidth - halfWidth, y });
          if (y - halfHeight < 0) Body.setPosition(body, { x, y: halfHeight });
          if (y + halfHeight > canvasHeight)
            Body.setPosition(body, { x, y: canvasHeight - halfHeight });
        }
      });
    });

    Render.run(render.current);
    Runner.run(runner.current, engine.current);
  }

  window.addEventListener('resize', () => {
    resizeCanvas();
    scaleBoundaries();
    scaleWorld();
    previousCanvasWidth = canvasWidth
    previousCanvasHeight = canvasHeight
  });

  function resizeCanvas() {
    if (render.current) {
      canvasWidth = window.innerWidth / 5;
      canvasHeight = window.innerHeight / 3;

      render.current.options.width = canvasWidth;
      render.current.options.height = canvasHeight;

      if (render.current.canvas) {
        render.current.canvas.width = canvasWidth;
        render.current.canvas.height = canvasHeight;
      }
    }
  }

  function scaleWorld() {
    if (!canvas.current) return;
    const widthScale = window.innerWidth / previousCanvasWidth;
    const heightScale = window.innerHeight / previousCanvasHeight;

    engine.current.world.bodies.forEach((body) => {
      if (!body.isStatic) {
        Body.scale(body, widthScale, heightScale);
        Body.setPosition(body, {
          x: body.position.x * widthScale / currentScaleX,
          y: body.position.y * heightScale / currentScaleY,
        });
      }
    });

    currentScaleX = widthScale;
    currentScaleY = heightScale;
  }

  function scaleBoundaries() {

    const boundaries = engine.current.world.bodies.filter((body) =>
      ["top", "bottom", "left", "right"].includes(body.label)
    );
    Composite.remove(engine.current.world, boundaries);

    // Add new boundaries with updated dimensions
    Composite.add(engine.current.world, [
      Bodies.rectangle(
        canvasWidth / 2,
        offset / 2,
        canvasWidth + 2 * offset,
        50.5,
        {
          isStatic: true,
          label: "top",
          render: renderOptions,
        }
      ),
      Bodies.rectangle(
        canvasWidth / 2,
        canvasHeight - offset / 2,
        canvasWidth + 2 * offset,
        50.5,
        {
          isStatic: true,
          label: "bottom",
          render: renderOptions,
        }
      ),
      Bodies.rectangle(
        offset / 2,
        canvasHeight / 2,
        50.5,
        canvasHeight + 2 * offset,
        {
          isStatic: true,
          label: "left",
          angle: 3,
          render: renderOptions,
        }
      ),
      Bodies.rectangle(
        canvasWidth - offset / 2,
        canvasHeight / 2,
        50.5,
        canvasHeight + 2 * offset,
        {
          isStatic: true,
          label: "right",
          angle: -3,
          render: renderOptions,
        }
      ),
    ]);
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
