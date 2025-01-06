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

  const offset = 0;
  const renderOptions = {
      strokeStyle: "transparent",
      fillStyle: "transparent",
  };

  // BUCKET STATICS
  const BUCKET_HEIGHT_VH = 0.75;
  const BUCKET_SCALE = 0.55;
  const INNER_BUCKET_RATIO = 0.6;
  const HEIGHT_TO_WIDTH_BUCKET_RATIO = 0.78;

  const getBoundariesHeight = () => {
    return window.innerHeight * 0.03
  }
  const getBoundariesWidth = () => {
    return window.innerWidth * 0.03
  }

  const getBucketHeight = () => {
    return window.innerHeight * BUCKET_HEIGHT_VH * BUCKET_SCALE;
  }

  const getCanvasHeight = () => {
    return getBucketHeight() * INNER_BUCKET_RATIO + getBoundariesHeight();
  }

  const getCanvasWidth = () => {
    return getBucketHeight() * HEIGHT_TO_WIDTH_BUCKET_RATIO;
  }

  const getCoverHeight = () => {
    return 2 * (window.innerWidth + window.innerHeight) / 333;
  }

  const getCoverWidth = () => {
    return 3 * (window.innerWidth + window.innerHeight) / 333;
  }

  let previousCanvasWidth = getCanvasWidth();
  let previousCanvasHeight = getCanvasHeight();

  useEffect(() => {
    const covers: string[] = [];
    getMovies({ random: true, watched: false, limit: 40 })
      .then((movies) => {
        if (movies) {
          for (const movie of movies) {
            covers.push(movie["cover_link"]);
          }
        }
        animationRender(covers);
      })
      .catch((error) => {
        console.error("Error fetching random covers:", error);
      });
    return () => {
      clearRenderer();
    };
  });

  function animationRender(covers: string[]) {
    if (!canvas.current) return;
    clearRenderer();

    render.current = Render.create({
      element: canvas.current,
      engine: engine.current,
      options: {
        width: getCanvasWidth(),
        height: getCanvasHeight(),
        showAngleIndicator: false,
        wireframes: false,
        background: "transparent",
        wireframeBackground: "transparent",
        pixelRatio: window.devicePixelRatio,
      },
    });

    Composite.add(engine.current.world, getBoundaries());

    for (const cover of covers) {
      Composite.add(
        engine.current.world,
        Bodies.rectangle(
          Math.random() * getCanvasWidth() - offset + getCoverWidth() / 2,
          Math.random() * getCanvasHeight() - offset + getCoverHeight() / 2,
          getCoverWidth(),
          getCoverHeight(),
          {
            friction: 0.3,
            restitution: 0.3,
            render: {
              sprite: {
                xScale: 0.05,
                yScale: 0.05,
                texture: cover,
              },
            },
        }),
      );
    }

    engine.current.timing.timeScale = 0.05;
    engine.current.gravity.scale = 0.03;

    Events.on(engine.current, "beforeUpdate", () => {
      // TODO: extract to functions to describe blocks
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

  window.addEventListener('resize', () => {
    resizeCanvas();
    setNewBoundaries();
    scaleCovers();
    previousCanvasWidth = getCanvasWidth()
    previousCanvasHeight = getCanvasHeight()
  });

  function resizeCanvas() {
    if (render.current) {
      render.current.options.width = getCanvasWidth();
      render.current.options.height = getCanvasHeight();

      if (render.current.canvas) {
        render.current.canvas.width = getCanvasWidth();
        render.current.canvas.height = getCanvasHeight();
      }
    }
  }

  function getBoundaries() {
    return [
      Bodies.rectangle(
        getCanvasWidth() / 2,
        offset / 2,
        getCanvasWidth() + 2 * offset,
        getBoundariesHeight(),
        {
          isStatic: true,
          label: "top",
          render: renderOptions
        }
      ),
      Bodies.rectangle(
        getCanvasWidth() / 2,
        getCanvasHeight() - offset / 2,
        getCanvasWidth() + 2 * offset,
        getBoundariesHeight(),
        {
          isStatic: true,
          label: "bottom",
          render: renderOptions
        }
      ),
      Bodies.rectangle(
        offset / 2,
        getCanvasHeight() / 2,
        getBoundariesWidth(),
        getCanvasHeight() + 2 * offset,
        {
          isStatic: true,
          label: "left",
          angle: 3,
          render: renderOptions
        }
      ),
      Bodies.rectangle(
        getCanvasWidth() - offset / 2,
        getCanvasHeight() / 2,
        getBoundariesWidth(),
        getCanvasHeight() + 2 * offset,
        {
          isStatic: true,
          label: "right",
          angle: -3,
          render: renderOptions
        }
      )
    ];
  }

  function setNewBoundaries() {

    const boundaries = engine.current.world.bodies.filter((body) =>
      ["top", "bottom", "left", "right"].includes(body.label)
    );

    Composite.remove(engine.current.world, boundaries);
    Composite.add(engine.current.world, getBoundaries());
  }

  function scaleCovers() {
    if (!canvas.current) return;
    const widthScale = getCanvasWidth() / previousCanvasWidth;
    const heightScale = getCanvasHeight() / previousCanvasHeight;

    engine.current.world.bodies.forEach((body) => {
      if (!body.isStatic && body.render.sprite) {
        Body.scale(body, widthScale, heightScale);
        body.render.sprite.xScale = body.render.sprite?.xScale * widthScale;
        body.render.sprite.yScale = body.render.sprite?.yScale * heightScale;
      }
    });
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
