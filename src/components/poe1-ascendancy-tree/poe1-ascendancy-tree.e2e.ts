import { newE2EPage } from '@stencil/core/testing';

describe('poe1-ascendancy-tree', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<poe1-ascendancy-tree></poe1-ascendancy-tree>');
    const element = await page.find('poe1-ascendancy-tree');
    expect(element).toHaveClass('hydrated');
  });

  it('renders changes to the name data', async () => {
    const page = await newE2EPage();

    await page.setContent('<poe1-ascendancy-tree></poe1-ascendancy-tree>');
    const component = await page.find('poe1-ascendancy-tree');
    const element = await page.find('poe1-ascendancy-tree >>> div');
    expect(element.textContent).toEqual(`Hello, World! I'm `);

    component.setProperty('first', 'James');
    await page.waitForChanges();
    expect(element.textContent).toEqual(`Hello, World! I'm James`);

    component.setProperty('last', 'Quincy');
    await page.waitForChanges();
    expect(element.textContent).toEqual(`Hello, World! I'm James Quincy`);

    component.setProperty('middle', 'Earl');
    await page.waitForChanges();
    expect(element.textContent).toEqual(`Hello, World! I'm James Earl Quincy`);
  });
});
