import { newSpecPage } from '@stencil/core/testing';
import { Poe1AscendancyTree } from './poe1-ascendancy-tree';

describe('poe1-ascendancy-tree', () => {
  it('renders', async () => {
    const { root } = await newSpecPage({
      components: [Poe1AscendancyTree],
      html: '<poe1-ascendancy-tree></poe1-ascendancy-tree>',
    });
    expect(root).toEqualHtml(`
      <poe1-ascendancy-tree>
        <mock:shadow-root>
          <div>
            Hello, World! I'm
          </div>
        </mock:shadow-root>
      </poe1-ascendancy-tree>
    `);
  });

  it('renders with values', async () => {
    const { root } = await newSpecPage({
      components: [Poe1AscendancyTree],
      html: `<poe1-ascendancy-tree first="Stencil" middle="'Don't call me a framework'" last="JS"></poe1-ascendancy-tree>`,
    });
    expect(root).toEqualHtml(`
      <poe1-ascendancy-tree first="Stencil" middle="'Don't call me a framework'" last="JS">
        <mock:shadow-root>
          <div>
            Hello, World! I'm Stencil 'Don't call me a framework' JS
          </div>
        </mock:shadow-root>
      </poe1-ascendancy-tree>
    `);
  });
});
