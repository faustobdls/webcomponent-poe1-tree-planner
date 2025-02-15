import { Component, Element, Prop, h } from '@stencil/core';
import { AppAscendancyTree } from '../../utils/appAscendancy';
import { versions } from '../../utils/models/versions/verions';
import { SemVer } from 'semver';

@Component({
  tag: 'poe1-ascendancy-tree',
  styleUrl: 'poe1-ascendancy-tree.css',
  assetsDirs: ['assets'],
  shadow: true,
})
export class Poe1AscendancyTree {
  /**
   * The urlTree
   */
  @Prop() urlTree: string;

  decodedUrlParams: { [id: string]: string };

  hash: string;

  appTree: AppAscendancyTree = new AppAscendancyTree();

  id: string = 'fullSkillTreeContainer';
  @Element() el: HTMLElement;

  componentDidRender() {
    const query = this.appTree.decodeURLParams(this.urlTree);

    this.hash = this.urlTree.split('#')[1];

    const versionsJson: IVersions = {
      versions: [],
    };
    const semversions = Object.fromEntries(Object.entries(versions));
    for (const key in semversions) {
      const value = semversions[key];
      if (!(value instanceof SemVer)) {
        continue;
      }
      versionsJson.versions.push(value.version);
    }

    if (versionsJson.versions.indexOf(query['v']) === -1) {
      query['v'] = versionsJson.versions[versionsJson.versions.length - 1];
    }

    if (!query['c']) {
      query['c'] = '';
    }
    console.log(`edit: query = ${query['edit']}`);
    // if(!query['edit']){
    //     query['edit'] = 'false';
    // }

    // App.ChangeSkillTreeVersion(query['v'], query['c'], window.location.hash, `${query['edit'] === 'true'}`);
    const container = this.el.shadowRoot.querySelector(`#${this.id}`);
    this.appTree.launchAscendancy(container, query['v'], query['c'], versionsJson, this.hash, query['edit'] === 'true');
  }
 
  render() {
    return <div id={this.id}></div>;
  }
}
