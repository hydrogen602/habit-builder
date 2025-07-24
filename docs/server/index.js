import { jsx, jsxs } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, UNSAFE_withComponentProps, Outlet, UNSAFE_withErrorBoundaryProps, isRouteErrorResponse, Meta, Links, ScrollRestoration, Scripts } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { useState, useEffect } from "react";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, streamTimeout + 1e3);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const links = () => [{
  rel: "preconnect",
  href: "https://fonts.googleapis.com"
}, {
  rel: "preconnect",
  href: "https://fonts.gstatic.com",
  crossOrigin: "anonymous"
}, {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
}];
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
});
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary2({
  error
}) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "pt-16 p-4 container mx-auto",
    children: [/* @__PURE__ */ jsx("h1", {
      children: message
    }), /* @__PURE__ */ jsx("p", {
      children: details
    }), stack]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root,
  links
}, Symbol.toStringTag, { value: "Module" }));
function HabitBuilder() {
  const [goals, setGoals] = useState([]);
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalMax, setNewGoalMax] = useState(10);
  const [editingMaxValues, setEditingMaxValues] = useState({});
  useEffect(() => {
    const savedGoals = localStorage.getItem("habitBuilderGoals");
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("habitBuilderGoals", JSON.stringify(goals));
  }, [goals]);
  const addGoal = () => {
    if (newGoalName.trim()) {
      const maxValue = typeof newGoalMax === "number" && newGoalMax > 0 ? newGoalMax : 10;
      const newGoal = {
        id: Date.now().toString(),
        name: newGoalName.trim(),
        progress: 0,
        max: maxValue
      };
      setGoals([...goals, newGoal]);
      setNewGoalName("");
      setNewGoalMax(10);
    }
  };
  const incrementProgress = (id) => {
    setGoals(goals.map(
      (goal) => goal.id === id && goal.progress < goal.max ? { ...goal, progress: goal.progress + 1 } : goal
    ));
  };
  const resetProgress = (id) => {
    setGoals(goals.map(
      (goal) => goal.id === id ? { ...goal, progress: 0 } : goal
    ));
  };
  const handleMaxInputChange = (id, value) => {
    setEditingMaxValues((prev) => ({
      ...prev,
      [id]: value
    }));
    const parsed = parseInt(value);
    if (!isNaN(parsed) && parsed > 0) {
      setGoals(goals.map(
        (goal) => goal.id === id ? { ...goal, max: parsed, progress: Math.min(goal.progress, parsed) } : goal
      ));
    }
  };
  const handleMaxInputBlur = (id) => {
    const editingValue = editingMaxValues[id];
    if (editingValue !== void 0 && editingValue.trim() === "") {
      setGoals(goals.map(
        (goal) => goal.id === id ? { ...goal, max: 1, progress: Math.min(goal.progress, 1) } : goal
      ));
      setEditingMaxValues((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    } else if (editingValue !== void 0) {
      setEditingMaxValues((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }
  };
  const getMaxDisplayValue = (goal) => {
    return editingMaxValues[goal.id] !== void 0 ? editingMaxValues[goal.id] : goal.max.toString();
  };
  const deleteGoal = (id) => {
    setGoals(goals.filter((goal) => goal.id !== id));
  };
  const getProgressPercentage = (progress, max) => {
    return Math.round(progress / max * 100);
  };
  const getProgressColor = (progress, max) => {
    const percentage = getProgressPercentage(progress, max);
    if (percentage === 100) return "bg-green-500";
    if (percentage >= 75) return "bg-blue-500";
    if (percentage >= 50) return "bg-yellow-500";
    if (percentage >= 25) return "bg-orange-500";
    return "bg-red-500";
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gray-50 dark:bg-gray-900 py-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto px-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-4xl font-bold text-gray-800 dark:text-white mb-2", children: "Habit Builder" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "Track your goals and build better habits" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-gray-800 dark:text-white mb-4", children: "Add New Goal" }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: newGoalName,
            onChange: (e) => setNewGoalName(e.target.value),
            placeholder: "Enter goal name...",
            className: "flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white",
            onKeyPress: (e) => e.key === "Enter" && addGoal()
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("label", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Max:" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: newGoalMax,
              onChange: (e) => {
                const value = e.target.value;
                if (value === "") {
                  setNewGoalMax("");
                } else {
                  const parsed = parseInt(value);
                  if (!isNaN(parsed) && parsed > 0) {
                    setNewGoalMax(parsed);
                  } else {
                    setNewGoalMax(value);
                  }
                }
              },
              onBlur: () => {
                if (newGoalMax === "" || typeof newGoalMax === "string" || newGoalMax <= 0) {
                  setNewGoalMax(10);
                }
              },
              min: "1",
              className: "w-20 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: addGoal,
            disabled: !newGoalName.trim(),
            className: "px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
            children: "Add Goal"
          }
        )
      ] })
    ] }),
    goals.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx("div", { className: "text-gray-400 text-6xl mb-4", children: "🎯" }),
      /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2", children: "No goals yet" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 dark:text-gray-500", children: "Add your first goal to start tracking your progress!" })
    ] }) : /* @__PURE__ */ jsx("div", { className: "grid gap-6", children: goals.map((goal) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "bg-white dark:bg-gray-800 rounded-lg shadow-md p-6",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-800 dark:text-white", children: goal.name }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => deleteGoal(goal.id),
                className: "text-red-500 hover:text-red-700 text-sm font-medium",
                children: "Delete"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-2", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: [
                "Progress: ",
                goal.progress,
                " / ",
                goal.max
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-sm font-semibold text-gray-700 dark:text-gray-300", children: [
                getProgressPercentage(goal.progress, goal.max),
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3", children: /* @__PURE__ */ jsx(
              "div",
              {
                className: `h-3 rounded-full transition-all duration-300 ${getProgressColor(goal.progress, goal.max)}`,
                style: {
                  width: `${getProgressPercentage(goal.progress, goal.max)}%`
                }
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => incrementProgress(goal.id),
                disabled: goal.progress >= goal.max,
                className: "px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                children: "+1 Progress"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => resetProgress(goal.id),
                className: "px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors",
                children: "Reset"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Max:" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  value: getMaxDisplayValue(goal),
                  onChange: (e) => handleMaxInputChange(goal.id, e.target.value),
                  onBlur: () => handleMaxInputBlur(goal.id),
                  min: "1",
                  className: "w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                }
              )
            ] }),
            goal.progress === goal.max && /* @__PURE__ */ jsx("span", { className: "px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium", children: "🎉 Completed!" })
          ] })
        ]
      },
      goal.id
    )) }),
    goals.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-800 dark:text-white mb-4", children: "Statistics" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-blue-500", children: goals.length }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Total Goals" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-green-500", children: goals.filter((goal) => goal.progress === goal.max).length }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Completed" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-2xl font-bold text-orange-500", children: [
            Math.round(
              goals.reduce((acc, goal) => acc + getProgressPercentage(goal.progress, goal.max), 0) / goals.length
            ),
            "%"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Average Progress" })
        ] })
      ] })
    ] })
  ] }) });
}
function meta({}) {
  return [{
    title: "Habit Builder"
  }, {
    name: "description",
    content: "Track your goals and build better habits!"
  }];
}
const home = UNSAFE_withComponentProps(function Home() {
  return /* @__PURE__ */ jsx(HabitBuilder, {});
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: home,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-Cwn7YiHZ.js", "imports": ["/assets/chunk-EF7DTUVF-B8hWlioN.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": true, "module": "/assets/root-CmcmUs7Y.js", "imports": ["/assets/chunk-EF7DTUVF-B8hWlioN.js"], "css": ["/assets/root-CtAkokuo.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/home": { "id": "routes/home", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/home-BCUl_5ID.js", "imports": ["/assets/chunk-EF7DTUVF-B8hWlioN.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-afa98426.js", "version": "afa98426", "sri": void 0 };
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "unstable_middleware": false, "unstable_optimizeDeps": false, "unstable_splitRouteModules": false, "unstable_subResourceIntegrity": false, "unstable_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/home": {
    id: "routes/home",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
