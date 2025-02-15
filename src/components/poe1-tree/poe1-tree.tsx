import { Component, Element, Prop, h } from '@stencil/core';
import { format } from '../../utils/utils';
import { AppTree } from '../../utils/app';
import { versions } from '../../utils/models/versions/verions';
import { SemVer } from 'semver';

@Component({
  tag: 'poe1-tree',
  styleUrl: 'poe1-tree.css',
  assetsDirs: ['assets'],
  shadow: true,
})
export class Poe1Tree {
  /**
   * The urlTree
   */
  @Prop() urlTree: string;

  decodedUrlParams: { [id: string]: string };

  hash: string;

  appTree: AppTree = new AppTree();

  id: string = 'fullSkillTreeContainer';
  @Element() el: HTMLElement;

  container: Element;
  query: { [id: string]: string };

  componentDidRender() {

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

    this.query = this.appTree.decodeURLParams(this.urlTree);
    
    if(!this.urlTree.includes('pathofexile.com')){
      this.hash = this.urlTree.split('#')[1];
    }else{
      this.query = {
        'v': versionsJson.versions[versionsJson.versions.length - 1],
        'c': '',
        'edit': 'false',
      }
      const splited = this.urlTree.split('fullscreen-passive-skill-tree/');
      this.hash = `#${splited[1]}`;
      
    }

    

    if (versionsJson.versions.indexOf(this.query['v']) === -1) {
      this.query['v'] = versionsJson.versions[versionsJson.versions.length - 1];
    }

    if (!this.query['c']) {
      this.query['c'] = '';
    }
    
    // App.ChangeSkillTreeVersion(query['v'], query['c'], window.location.hash, `${query['edit'] === 'true'}`);
    const container = this.el.shadowRoot.querySelector(`#${this.id}`);
    this.appTree.launch(container, this.query['v'], this.query['c'], versionsJson, this.hash, this.query['edit'] === 'true');
  }
 
  render() {
    return (
      <div id={this.id}>
        <div class="skillTreePoints">
          <div id="skillTreeNormal" class="skillTreeNodes">
            <span id="skillTreeNormalNodeCount">0</span>/<span id="skillTreeNormalNodeCountMaximum">121</span>
          </div>
          <div id="skillTreeAscendancy" class="skillTreeNodes">
            <span id="skillTreeAscendancyNodeCount">0</span>/<span id="skillTreeAscendancyNodeCountMaximum">8</span>
          </div>
          <div id="skillTreeWildwoodAscendancy" class="skillTreeNodes">
            <span id="skillTreeWildwoodAscendancyNodeCount">0</span>/<span id="skillTreeWildwoodAscendancyNodeCountMaximum">8</span>
          </div>
        </div>
      </div>
    );
  }
}
