import { newSpecPage } from '@stencil/core/testing';
import { Poe1Tree } from './poe1-tree';

describe('poe1-tree', () => {
  it('renders', async () => {
    const { root } = await newSpecPage({
      components: [Poe1Tree],
      html: '<poe1-tree></poe1-tree>',
    });
    expect(root).toEqualHtml(`
      <poe1-tree>
        <mock:shadow-root>
          <div>
            Hello, World! I'm
          </div>
        </mock:shadow-root>
      </poe1-tree>
    `);
  });

  it('renders with values', async () => {
    const { root } = await newSpecPage({
      components: [Poe1Tree],
      html: `<poe1-tree first="Stencil" middle="'Don't call me a framework'" last="JS"></poe1-tree>`,
    });
    expect(root).toEqualHtml(`
      <poe1-tree first="Stencil" middle="'Don't call me a framework'" last="JS">
        <mock:shadow-root>
          <div>
            Hello, World! I'm Stencil 'Don't call me a framework' JS
          </div>
        </mock:shadow-root>
      </poe1-tree>
    `);
  });
});
