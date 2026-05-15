import type {
  FastifyPluginAsync,
  FastifyReply,
} from "fastify";
import fp from "fastify-plugin";
import {
  renderPage,
  type RenderPageOptions,
  type RendererContext,
} from "../renderer/render-page.js";

export interface VitifyPluginOptions extends RendererContext {
  decorateName?: string;
}

export interface VitifyInstance {
  renderPage(options: RenderPageOptions): Promise<string>;
}

export interface VitifyReply {
  render(options: RenderPageOptions): Promise<FastifyReply>;
}

declare module "fastify" {
  interface FastifyInstance {
    vitify: VitifyInstance;
  }

  interface FastifyReply {
    vitify: VitifyReply;
  }
}

const vitifyPlugin: FastifyPluginAsync<VitifyPluginOptions> = async (
  app,
  options,
) => {
  const decorateName = options.decorateName ?? "vitify";
  const rendererContext = createRendererContext(options);
  const instanceDecoration: VitifyInstance = {
    async renderPage(renderOptions) {
      const page = await renderPage(rendererContext, renderOptions);

      return page.html;
    },
  };

  app.decorate(decorateName, instanceDecoration);
  app.decorateReply(decorateName, null);
  app.addHook("onRequest", async (_request, reply) => {
    Object.defineProperty(reply, decorateName, {
      configurable: true,
      value: createReplyDecoration(reply, rendererContext),
    });
  });
};

function createRendererContext(options: VitifyPluginOptions): RendererContext {
  const { decorateName: _decorateName, ...rendererContext } = options;

  return rendererContext;
}

function createReplyDecoration(
  reply: FastifyReply,
  rendererContext: RendererContext,
): VitifyReply {
  return {
    async render(renderOptions) {
      const page = await renderPage(rendererContext, renderOptions);

      reply.code(page.status);
      for (const [name, value] of Object.entries(page.headers)) {
        reply.header(name, value);
      }

      return reply.send(page.html);
    },
  };
}

export const vitify = fp(vitifyPlugin, {
  fastify: "5.x",
  name: "vitify",
});

export default vitify;
