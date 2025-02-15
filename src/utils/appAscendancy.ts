import { utils } from './utils';
import { SemVer } from 'semver';
import { SkillTreeEvents } from './models/SkillTreeEvents';
import { versions } from './models/versions/verions';
import { SkillTreeData } from './models/SkillTreeData';
import { SkillTreePreprocessors } from './models/skill-tree/SkillTreePreprocessors';
import { SkillTreeUtilities } from './models/SkillTreeUtilities';
import { ISkillTreeRenderer } from './models/types/ISkillTreeRenderer';
import { UIEvents } from './models/events/UIEvents';
import { SkillNodeStates } from './models/SkillNode';
import { PIXISkillTreeRenderer } from './models/PIXISkillTreeRenderer';
import { PIXIAscendancyTreeRenderer } from './models/PIXIAscendancyTreeRenderer';

export class AppAscendancyTree {
  private skillTreeData!: SkillTreeData;
  private skillTreeDataCompare: SkillTreeData | undefined;
  private skillTreeUtilities!: SkillTreeUtilities;
  private renderer!: ISkillTreeRenderer;
  private uievents!: UIEvents;
  
  public launchAscendancy = async (container: Element, version: string, versionCompare: string, versionJson: IVersions, hash: string, edit: boolean) => {

    for (const i of [version, versionCompare]) {
      if (i === '') {
        continue;
      }

      let options: ISkillTreeOptions | undefined = undefined;
      const semver = new SemVer(i);
      if (semver.compare(versions.v2_2_0) >= 0 && semver.compare(versions.v3_9_0) <= 0) {
        options = await fetch(`${utils.SKILL_TREES_URI}/${i}/Opts.json`).then(response => (response.status === 200 ? response.json() : undefined));
      }
      var json = (await fetch(`${utils.SKILL_TREES_URI}/${i}/SkillTree.json`).then(response => response.json())) as ISkillTreeBase;
      const data = new SkillTreeData(SkillTreePreprocessors.Decode(json, options), semver);

      if (i === version) {
        this.skillTreeData = data;
      }

      if (i === versionCompare) {
        this.skillTreeDataCompare = data;
      }
    }
    this.uievents = new UIEvents(this.skillTreeData, this.skillTreeDataCompare);
    // change this receive param edit
    this.skillTreeUtilities = new SkillTreeUtilities(this.skillTreeData, this.skillTreeDataCompare, edit);

    if (container !== null) {
      this.renderer = new PIXIAscendancyTreeRenderer(container as HTMLElement, this.skillTreeData, this.skillTreeDataCompare);
      this.renderer
        .Initialize()
        .then(() => {
          this.SetupEventsAndControls(edit, true);
          this.renderer.RenderBaseAscendancy();
          this.skillTreeUtilities.decodeURL(hash);
          this.renderer.RenderCharacterStartsActive();
          this.renderer.RenderActiveAscendancy();
          this.renderer.PositionedOn();
        })
        .catch(reason => console.error(reason));
    }
  };

  private SetupEventsAndControls = (edit: boolean, ascendancy: boolean) => {
    if (edit) {
      // change this receive param edit
      SkillTreeEvents.skill_tree.on('highlighted-nodes-update', this.renderer.RenderHighlight);
      SkillTreeEvents.skill_tree.on('class-change', this.renderer.RenderCharacterStartsActive);
      SkillTreeEvents.skill_tree.on('class-change', this.updateClassControl);
      SkillTreeEvents.skill_tree.on('ascendancy-class-change', this.updateAscClassControl);
      SkillTreeEvents.skill_tree.on('wildwood-ascendancy-class-change', this.updateWildwoodAscClassControl);
    }

    if (ascendancy) {
      SkillTreeEvents.skill_tree.on('hovered-nodes-start', this.renderer.CustomStartRenderHover);
      SkillTreeEvents.skill_tree.on('hovered-nodes-end', this.renderer.CustomStopRenderHover);
    } else {
      SkillTreeEvents.skill_tree.on('hovered-nodes-start', this.renderer.StartRenderHover);
      SkillTreeEvents.skill_tree.on('hovered-nodes-end', this.renderer.StopRenderHover);
    }

    // change this receive param edit
    SkillTreeEvents.skill_tree.on('active-nodes-update', this.renderer.RenderActive);
    SkillTreeEvents.skill_tree.on('active-nodes-update', this.updateStats);

    SkillTreeEvents.skill_tree.on('normal-node-count', (count: number) => {
      const e = document.getElementById('skillTreeNormalNodeCount');
      if (e !== null) e.innerHTML = count.toString();
    });
    SkillTreeEvents.skill_tree.on('normal-node-count-maximum', (count: number) => {
      const e = document.getElementById('skillTreeNormalNodeCountMaximum');
      if (e !== null) e.innerHTML = count.toString();
    });
    SkillTreeEvents.skill_tree.on('ascendancy-node-count', (count: number) => {
      const e = document.getElementById('skillTreeAscendancyNodeCount');
      if (e !== null) e.innerHTML = count.toString();
    });
    SkillTreeEvents.skill_tree.on('ascendancy-node-count-maximum', (count: number) => {
      const e = document.getElementById('skillTreeAscendancyNodeCountMaximum');
      if (e !== null) e.innerHTML = count.toString();
    });
    SkillTreeEvents.skill_tree.on('wildwood-ascendancy-node-count', (count: number) => {
      const e = document.getElementById('skillTreeWildwoodAscendancyNodeCount');
      if (e !== null) e.innerHTML = count.toString();
    });
    SkillTreeEvents.skill_tree.on('wildwood-ascendancy-node-count-maximum', (count: number) => {
      const e = document.getElementById('skillTreeWildwoodAscendancyNodeCountMaximum');
      if (e !== null) e.innerHTML = count.toString();
    });

    if (edit) {
      this.populateStartClasses(document.getElementById('skillTreeControl_Class') as HTMLSelectElement);

      const controls = document.getElementsByClassName('skillTreeControls') as HTMLCollectionOf<HTMLDivElement>;
      // remove controlls
      for (const i in controls) {
        if (controls[i].style !== undefined) {
          controls[i].style.removeProperty('display');
        }
      }

      const points = document.getElementsByClassName('skillTreePoints') as HTMLCollectionOf<HTMLDivElement>;
      for (const i in points) {
        if (points[i].style !== undefined) {
          points[i].style.removeProperty('display');
        }
      }
    }
  };

  private masteries: string[] | undefined = undefined;
  private masteryTest: { [name: string]: string } | undefined = undefined;
  private defaultStats: { [stat: string]: boolean } | undefined = undefined;
  private buildStatLookups = (defaultGroup: string): [masteries: string[], masteryTest: { [name: string]: string }, defaultStats: { [stat: string]: boolean }] => {
    if (this.masteries === undefined || this.masteryTest === undefined) {
      const masteries: string[] = ['The Maven'];
      const masteryTest: { [name: string]: string } = { 'The Maven': ' Maven' };
      for (const id in this.skillTreeData.nodes) {
        const node = this.skillTreeData.nodes[id];
        const mastery = this.skillTreeData.getMasteryForGroup(node.nodeGroup);
        if (mastery !== null && mastery.name !== defaultGroup) {
          masteries.push(mastery.name);
          masteryTest[mastery.name] = mastery.name.replace('The', '').replace('Mastery', '');
        }
      }
      this.masteries = masteries;
      this.masteryTest = masteryTest;
    }

    if (this.defaultStats === undefined) {
      const defaultStats: { [stat: string]: boolean } = {};
      for (const id in this.skillTreeData.nodes) {
        const node = this.skillTreeData.nodes[id];
        for (const stat of node.stats) {
          if (defaultStats[stat] !== undefined) {
            continue;
          }

          const mastery = this.skillTreeData.getMasteryForGroup(node.nodeGroup);
          if (mastery === null) {
            let found = false;
            for (const name of this.masteries) {
              if (stat.indexOf(this.masteryTest[name]) >= 0) {
                found = true;
                break;
              }
            }

            if (!found) {
              defaultStats[stat] = true;
            }
          }
        }
      }
      this.defaultStats = defaultStats;
    }
    return [this.masteries, this.masteryTest, this.defaultStats];
  };

  private updateStats = () => {
    const defaultGroup = this.skillTreeData.isAtlasTree() ? 'Maps' : 'Default';
    const [masteries, masteryTest, defaultStats] = this.buildStatLookups(defaultGroup);

    const groups: { [group: string]: string[] } = {};
    const statGroup: { [stat: string]: string } = {};
    const stats: { [stat: string]: number } = {};
    const nodes = this.skillTreeData.getSkilledNodes();
    for (const id in nodes) {
      const node = nodes[id];
      for (const stat of node.stats) {
        if (stats[stat] === undefined) {
          stats[stat] = 1;
        } else {
          stats[stat] = stats[stat] + 1;
        }

        if (statGroup[stat] !== undefined) {
          const group = statGroup[stat];
          if (groups[group].indexOf(stat) === -1) {
            groups[group].push(stat);
          }
          continue;
        }

        if (defaultStats[stat]) {
          if (groups[defaultGroup] === undefined) {
            groups[defaultGroup] = [];
          }

          if (groups[defaultGroup].indexOf(stat) === -1) {
            statGroup[stat] = defaultGroup;
            groups[defaultGroup].push(stat);
          }
          continue;
        }

        const mastery = this.skillTreeData.getMasteryForGroup(node.nodeGroup);
        if (mastery !== null) {
          if (groups[mastery.name] === undefined) {
            groups[mastery.name] = [];
          }

          if (groups[mastery.name].indexOf(stat) === -1) {
            statGroup[stat] = mastery.name;
            groups[mastery.name].push(stat);
          }
        } else {
          let group = defaultGroup;
          for (const name of masteries) {
            if (stat.indexOf(masteryTest[name]) >= 0) {
              group = name;
              break;
            }
          }

          if (groups[group] === undefined) {
            groups[group] = [];
          }

          if (groups[group].indexOf(stat) === -1) {
            statGroup[stat] = group;
            groups[group].push(stat);
          }
        }
      }
    }

    const content = document.getElementById('skillTreeStats_Content') as HTMLDivElement;
    while (content.firstChild) {
      content.removeChild(content.firstChild);
    }

    for (const name of Object.keys(groups).sort((a, b) => (a === defaultGroup ? -1 : b === defaultGroup ? 1 : a < b ? -1 : 1))) {
      const groupStats: { [stat: string]: number } = {};
      for (const stat of groups[name]) {
        groupStats[stat] = stats[stat];
      }
      const div = this.createStatGroup(name, groupStats);
      content.appendChild(div);
    }
  };

  private createStatGroup = (name: string, stats: { [stat: string]: number }): HTMLDivElement => {
    const group = document.createElement('div');
    group.className = 'group';

    const title = document.createElement('span');
    title.className = 'title';
    title.innerText = name;
    title.addEventListener('click', () => {
      const elements = document.querySelectorAll(`[data-group-name="${name}"]`);
      elements.forEach(element => {
        element.toggleAttribute('hidden');
      });
    });

    group.appendChild(title);

    for (const stat of Object.keys(stats).sort()) {
      const num = stats[stat];
      group.appendChild(this.createStat(name, `${num}x ${stat}`));
    }

    return group;
  };

  private createStat = (group: string, stat: string): HTMLDivElement => {
    const div = document.createElement('div');
    div.className = 'stat';
    div.innerText = stat;
    div.setAttribute('data-group-name', group);
    return div;
  };

  private populateStartClasses = (classControl: HTMLSelectElement) => {
    while (classControl.firstChild) {
      classControl.removeChild(classControl.firstChild);
    }

    const options = new Array<HTMLOptionElement>();
    for (const id in this.skillTreeData.classStartNodes) {
      const classId = this.skillTreeData.nodes[id].classStartIndex;
      if (classId === undefined) {
        continue;
      }
      const e = document.createElement('option');
      e.text = this.skillTreeData.root.out.length === 1 ? 'Atlas' : this.skillTreeData.constants.classIdToName[classId];
      e.value = classId.toString();

      if (classId === this.skillTreeData.getStartClass()) {
        e.setAttribute('selected', 'selected');
      }
      options.push(e);
    }

    options.sort((a, b) => {
      const first = a.value;
      const second = b.value;
      if (first !== null && second !== null) {
        return +first - +second;
      }
      return 0;
    });

    for (const e of options) {
      classControl.append(e);
    }

    const ascControl = document.getElementById('skillTreeControl_Ascendancy') as HTMLSelectElement;
    if (ascControl !== null) {
      this.populateAscendancyClasses(ascControl);
    }

    const wildwoodAscControl = document.getElementById('skillTreeControl_WildwoodAscendancy') as HTMLSelectElement;
    if (wildwoodAscControl !== null) {
      this.populateWildwoodAscendancyClasses(wildwoodAscControl);
    }

    classControl.onchange = () => {
      const val = classControl.value;
      SkillTreeEvents.controls.fire('class-change', +val);
      if (ascControl !== null) {
        this.populateAscendancyClasses(ascControl, +val, 0);
      }
      if (wildwoodAscControl !== null) {
        this.populateWildwoodAscendancyClasses(wildwoodAscControl, 0);
      }
    };
  };

  private updateClassControl = () => {
    const start = this.skillTreeData.getStartClass();
    (document.getElementById('skillTreeControl_Class') as HTMLSelectElement).value = String(start);
  };

  private updateAscClassControl = () => {
    if (this.skillTreeData.classes.length === 0) {
      return;
    }

    const start = this.skillTreeData.getAscendancyClass();
    const ascClasses = this.skillTreeData.classes[this.skillTreeData.getStartClass()].ascendancies;
    if (ascClasses === undefined) {
      return;
    }

    const ascControl = document.getElementById('skillTreeControl_Ascendancy') as HTMLSelectElement;
    this.createAscendancyClassOptions(ascControl, ascClasses, start);
  };

  private populateAscendancyClasses = (ascControl: HTMLSelectElement, start: number | undefined = undefined, startasc: number | undefined = undefined) => {
    while (ascControl.firstChild) {
      ascControl.removeChild(ascControl.firstChild);
    }

    if (this.skillTreeData.classes.length === 0) {
      ascControl.style.display = 'none';
      const e = document.getElementById('skillTreeAscendancy') as HTMLDivElement;
      if (e !== null) e.style.display = 'none';
      return;
    }

    const startClass = start !== undefined ? start : this.skillTreeData.getStartClass();
    const ascClasses = this.skillTreeData.classes[startClass].ascendancies;
    if (ascClasses === undefined) {
      return;
    }

    const ascStart = startasc !== undefined ? startasc : this.skillTreeData.getAscendancyClass();
    this.createAscendancyClassOptions(ascControl, ascClasses, ascStart);

    ascControl.onchange = () => {
      SkillTreeEvents.controls.fire('ascendancy-class-change', +ascControl.value);
    };
  };

  private updateWildwoodAscClassControl = () => {
    if (this.skillTreeData.alternate_ascendancies.length === 0) {
      return;
    }

    const start = this.skillTreeData.getWildwoodAscendancyClass();
    const ascClasses = this.skillTreeData.alternate_ascendancies;
    if (ascClasses === undefined) {
      return;
    }

    const ascControl = document.getElementById('skillTreeControl_WildwoodAscendancy') as HTMLSelectElement;
    this.createAscendancyClassOptions(ascControl, ascClasses, start);
  };

  private populateWildwoodAscendancyClasses = (ascControl: HTMLSelectElement, startasc: number | undefined = undefined) => {
    while (ascControl.firstChild) {
      ascControl.removeChild(ascControl.firstChild);
    }

    if (this.skillTreeData.alternate_ascendancies.length === 0) {
      ascControl.style.display = 'none';
      const e = document.getElementById('skillTreeWildwoodAscendancy') as HTMLDivElement;
      if (e !== null) e.style.display = 'none';
      return;
    }

    const ascClasses = this.skillTreeData.alternate_ascendancies;
    if (ascClasses === undefined) {
      return;
    }

    const ascStart = startasc !== undefined ? startasc : this.skillTreeData.getAscendancyClass();
    this.createAscendancyClassOptions(ascControl, ascClasses, ascStart);

    ascControl.onchange = () => {
      SkillTreeEvents.controls.fire('wildwood-ascendancy-class-change', +ascControl.value);
    };
  };

  private createAscendancyClassOptions = (control: HTMLSelectElement, classes: IAscendancyClassV7[], start: number) => {
    while (control.firstChild) {
      control.removeChild(control.firstChild);
    }

    const none = document.createElement('option');
    none.text = 'None';
    none.value = '0';
    if (start === 0) {
      none.setAttribute('selected', 'selected');
    }
    control.append(none);

    if (classes.length === 0) {
      return;
    }

    for (const id in classes) {
      const asc = classes[id];
      const value = +id + 1;

      const e = document.createElement('option');
      e.text = asc.id;
      e.value = `${value}`;

      if (value === start) {
        e.setAttribute('selected', 'selected');
      }
      control.append(e);
    }
  };

  public decodeURLParams = (search = ''): { [id: string]: string } => {
    const hashes = search.slice(search.indexOf('?') + 1).split('&');
    return hashes.reduce((params, hash) => {
      const split = hash.indexOf('=');

      if (split < 0) {
        return Object.assign(params, {
          [hash]: null,
        });
      }

      const key = hash.slice(0, split);
      const val = hash.slice(split + 1);

      return Object.assign(params, { [key]: decodeURIComponent(val) });
    }, {});
  };

  public ChangeSkillTreeVersion = (version: string, compare: string, hash: string, edit: string) => {
    let search = '?';
    if (version !== '') {
      search += `v=${version}`;
    }

    if (!search.endsWith('?') && compare !== '') search += '&';

    if (compare !== '') {
      search += `c=${compare}`;
    }
    if (!search.endsWith('?') && edit !== '') search += '&';
    if (edit !== '') {
      search += `edit=${edit}`;
    }

    if (window.location.hash !== hash) {
      window.location.hash = hash;
    }

    if (window.location.search !== search) {
      window.location.search = search;
    }
  };
}
