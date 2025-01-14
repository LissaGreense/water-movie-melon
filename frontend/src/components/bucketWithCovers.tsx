import bucket from "../assets/bucket.png";
import { useEffect, useRef } from "react";
import { getMovies } from "../connections/internal/movie.ts";
import {
  Bodies,
  Body,
  Composite,
  Engine,
  Events,
  Render,
  Runner,
} from "matter-js";
import "./bucketWithCovers.css";
import {
  BOUNDARIES_OFFSET,
  BOUNDARIES_SCALE,
  BUCKET_HEIGHT_VH,
  BUCKET_SCALE,
  GRAVITY_TIMESTAMP_SCALE,
  HEIGHT_TO_WIDTH_BUCKET_RATIO,
  INNER_BUCKET_RATIO,
  renderOptions,
  VERTICAL_CANVAS_HEIGHT_SCALE,
  VERTICAL_CANVAS_WIDTH_SCALE,
} from "../constants/bucketWithCoversConstants.ts";

export function BucketWithCovers() {
  const canvas = useRef<HTMLDivElement>(null);
  const engine = useRef<Engine>(Engine.create());
  const render = useRef<Render>();
  const runner = useRef<Runner>(Runner.create());

  const isDisplayHorizontal = () => {
    return window.innerWidth > window.innerHeight;
  };

  const getBoundariesHeight = () => {
    return window.innerHeight * BOUNDARIES_SCALE;
  };
  const getBoundariesWidth = () => {
    return window.innerWidth * BOUNDARIES_SCALE;
  };

  const getBucketHeight = () => {
    return window.innerHeight * BUCKET_HEIGHT_VH * BUCKET_SCALE;
  };

  const getCanvasHeight = () => {
    if (isDisplayHorizontal()) {
      return getBucketHeight() * INNER_BUCKET_RATIO + getBoundariesHeight();
    }
    return (
      (getBucketHeight() * INNER_BUCKET_RATIO + getBoundariesHeight()) *
      VERTICAL_CANVAS_HEIGHT_SCALE
    );
  };

  const getCanvasWidth = () => {
    if (isDisplayHorizontal()) {
      return getBucketHeight() * HEIGHT_TO_WIDTH_BUCKET_RATIO;
    }
    return (
      getBucketHeight() *
      HEIGHT_TO_WIDTH_BUCKET_RATIO *
      VERTICAL_CANVAS_WIDTH_SCALE
    );
  };

  const getCoverHeight = () => {
    return (3 * (window.innerWidth + window.innerHeight)) / 333;
  };

  const getCoverWidth = () => {
    return (2 * (window.innerWidth + window.innerHeight)) / 333;
  };

  const getSpriteScale = () => {
    return (window.innerWidth + window.innerHeight) / 55414;
  };

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

  function rotateGravityVector() {
    engine.current.gravity.x = Math.cos(
      engine.current.timing.timestamp * GRAVITY_TIMESTAMP_SCALE,
    );

    engine.current.gravity.y = Math.sin(
      engine.current.timing.timestamp * GRAVITY_TIMESTAMP_SCALE,
    );
  }

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
          Math.random() * getCanvasWidth() + getCoverWidth() / 2,
          Math.random() * getCanvasHeight() + getCoverHeight() / 2,
          getCoverWidth(),
          getCoverHeight(),
          {
            friction: 0.3,
            restitution: 0.3,
            render: {
              sprite: {
                xScale: getSpriteScale(),
                yScale: getSpriteScale(),
                texture: cover,
              },
            },
          },
        ),
      );
    }

    engine.current.timing.timeScale = 0.05;
    engine.current.gravity.scale = 0.03;

    Events.on(engine.current, "beforeUpdate", () => {
      rotateGravityVector();
    });

    Render.run(render.current);
    Runner.run(runner.current, engine.current);
  }

  window.addEventListener("resize", () => {
    resizeCanvas();
    setNewBoundaries();
    scaleCovers();
    previousCanvasWidth = getCanvasWidth();
    previousCanvasHeight = getCanvasHeight();
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
        0,
        getCanvasWidth(),
        getBoundariesHeight(),
        {
          isStatic: true,
          label: "top",
          render: renderOptions,
        },
      ),
      Bodies.rectangle(
        getCanvasWidth() / 2,
        getCanvasHeight(),
        getCanvasWidth(),
        getBoundariesHeight(),
        {
          isStatic: true,
          label: "bottom",
          render: renderOptions,
        },
      ),
      Bodies.rectangle(
        BOUNDARIES_OFFSET,
        getCanvasHeight() / 2,
        getBoundariesWidth(),
        getCanvasHeight(),
        {
          isStatic: true,
          label: "left",
          angle: 3,
          render: renderOptions,
        },
      ),
      Bodies.rectangle(
        getCanvasWidth() - BOUNDARIES_OFFSET,
        getCanvasHeight() / 2,
        getBoundariesWidth(),
        getCanvasHeight(),
        {
          isStatic: true,
          label: "right",
          angle: -3,
          render: renderOptions,
        },
      ),
    ];
  }

  function setNewBoundaries() {
    const boundaries = engine.current.world.bodies.filter((body) =>
      ["top", "bottom", "left", "right"].includes(body.label),
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
