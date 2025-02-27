import { newE2EPage } from '@stencil/core/testing';

describe('poe1-tree', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<poe1-tree></poe1-tree>');
    const element = await page.find('poe1-tree');
    expect(element).toHaveClass('hydrated');
  });

  it('renders changes to the name data', async () => {
    const page = await newE2EPage();

    await page.setContent('<poe1-tree></poe1-tree>');
    const component = await page.find('poe1-tree');
    const element = await page.find('poe1-tree >>> div');
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
