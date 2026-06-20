import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { AlertTriangle, ArrowLeft, ArrowUp, BookOpen, Check, ChevronDown, ChevronRight, ClipboardList, Cog, Command, Copy, Database, Download, Ellipsis, FileInput, Hammer, Layers, LibraryBig, Minus, PanelsTopLeft, Plus, Search, Share2, ShieldCheck, Sparkles, Split, Star, StickyNote, Wand2, X } from "lucide-react";
import { mockCatalogues } from "../../data/mockRoster";
import type { ConceptProps } from "../shared";
import { BackOrTitle, BudgetMeter, Chip, flattenUnits, priceLabel, rosterChecks, shellClass, StatusGlyph } from "./uxShared";

/**
 * Codex Workbench — the single merged design.
 * Master/detail workbench (tree + live detail + validation rail) with a library
 * entry, a roster-creation flow, and a Settings-gated smart-search tier. Main
 * navigation can be rendered as a top bar, a bottom tab bar, or a floating tab
 * bar so the directions can be compared side by side.
 */
export function CodexWorkbench(props: ConceptProps) {
  const navStyle = props.navStyle ?? "top";
  const usesTabNavigation = navStyle !== "top";
  const smart = props.smartSearch ?? false;
  const screen = props.screen;
  const isUnitDetail = screen === "unit-detail";
  const isMainTab = props.workflowScreen
    ? (["library", "source", "tools", "settings"] as const).some((tab) => tab === props.workflowScreen)
    : screen === "library" || screen === "catalogue" || screen === "tools" || screen === "settings";
  const showTabBar = usesTabNavigation && isMainTab;
  const shell = `ux-screen ux-workbench ${shellClass(props.themeMode, props.colorScheme)} ${showTabBar ? "has-tabs" : ""}`.trim();
  const [activeLoadoutSlot, setActiveLoadoutSlot] = useState<{ groupId: string; slotId: string } | null>(null);
  const detailScrollRef = useRef<HTMLElement>(null);
  const loadoutScrollTopRef = useRef(0);

  const restoreDetailScroll = useCallback(() => {
    window.requestAnimationFrame(() => {
      if (detailScrollRef.current) detailScrollRef.current.scrollTop = loadoutScrollTopRef.current;
    });
  }, []);

  const openLoadoutSelector = useCallback((groupId: string, slotId: string) => {
    loadoutScrollTopRef.current = detailScrollRef.current?.scrollTop ?? 0;
    setActiveLoadoutSlot({ groupId, slotId });
    restoreDetailScroll();
  }, [restoreDetailScroll]);

  const closeLoadoutSelector = useCallback(() => {
    setActiveLoadoutSlot(null);
    restoreDetailScroll();
  }, [restoreDetailScroll]);

  useEffect(() => {
    setActiveLoadoutSlot(null);
  }, [screen, props.selectedUnit.id, props.unitDetailView]);

  let body: ReactNode;
  let modifier = "";

  if (screen === "library") {
    body = <Library props={props} />;
  } else if (screen === "catalogue") {
    body = <LookupScreen props={props} />;
  } else if (screen === "tools") {
    body = <ToolsScreen props={props} />;
  } else if (screen === "settings") {
    body = <SettingsScreen props={props} />;
  } else if (screen === "system") {
    body = <CreateScreen props={props} />;
  } else {
    const smartClass = navStyle === "top" && smart ? "ux-smart" : "";
    modifier = [isUnitDetail ? "show-detail has-detail-toggle" : "", screen === "validation" ? "show-checks" : "", smartClass].filter(Boolean).join(" ");
    body = (
      <>
        <WorkbenchHeader props={props} />
        {!isUnitDetail ? (
          <div className="ux-wb-budget">
            <BudgetMeter roster={props.roster} />
          </div>
        ) : null}
        <div className="ux-wb-layout">
          <Tree props={props} />
          <Detail props={props} scrollRef={detailScrollRef} onOpenLoadoutSlot={openLoadoutSelector} />
          <Rail props={props} />
        </div>
      </>
    );
  }

  const isWorkbenchScreen = screen !== "library" && screen !== "catalogue" && screen !== "tools" && screen !== "settings" && screen !== "system";
  const showCommandBar = navStyle === "top" && smart && isWorkbenchScreen && !isUnitDetail;

  return (
    <div className={`${shell} ${modifier}`.trim()}>
      {body}
      {activeLoadoutSlot ? <LoadoutSelector props={props} target={activeLoadoutSlot} onClose={closeLoadoutSelector} /> : null}
      {showTabBar ? <TabBar props={props} /> : isUnitDetail ? <DetailModeBar props={props} /> : showCommandBar ? <CommandBar props={props} /> : null}
    </div>
  );
}

function DetailModeBar({ props }: { props: ConceptProps }) {
  const active = props.unitDetailView ?? "options";
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="ux-detail-mode-layer">
      {menuOpen ? (
        <div className="ux-detail-action-menu" role="menu" aria-label="Unit actions">
          <button type="button" role="menuitem" onClick={() => setMenuOpen(false)}><Copy size={15} />Duplicate</button>
          <button type="button" role="menuitem" onClick={() => setMenuOpen(false)}><StickyNote size={15} />Add note</button>
          <button type="button" role="menuitem" onClick={() => setMenuOpen(false)}><Share2 size={15} />Share</button>
        </div>
      ) : null}
      <nav className="ux-detail-mode-bar" aria-label="Unit detail view">
        <button type="button" className={`ux-detail-mode-tab ${active === "options" ? "active" : ""}`} onClick={() => props.onUnitDetailViewChange?.("options")} aria-pressed={active === "options"}>
          <Cog size={18} />
          <span>Options</span>
        </button>
        <button type="button" className={`ux-detail-menu-fab ${menuOpen ? "active" : ""}`} onClick={() => setMenuOpen((open) => !open)} aria-label="More unit actions" aria-expanded={menuOpen}>
          <Ellipsis size={22} />
        </button>
        <button type="button" className={`ux-detail-mode-tab ${active === "profile" ? "active" : ""}`} onClick={() => props.onUnitDetailViewChange?.("profile")} aria-pressed={active === "profile"}>
          <BookOpen size={18} />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
}

function WorkbenchHeader({ props }: { props: ConceptProps }) {
  const isUnitDetail = props.screen === "unit-detail";
  const pointsRemaining = props.roster.pointsLimit - props.roster.pointsUsed;
  const progress = Math.min(100, Math.max(0, (props.roster.pointsUsed / props.roster.pointsLimit) * 100));
  const remainingLabel = pointsRemaining >= 0 ? `${pointsRemaining} pts left` : `${Math.abs(pointsRemaining)} pts over`;

  return (
    <header className={`ux-wb-top ${isUnitDetail ? "unit-detail" : ""}`}>
      <BackOrTitle
        props={props}
        fallback={
          <button type="button" className="ux-icon-btn" aria-label="Lists" onClick={() => props.onNavigate("library")}>
            <Layers size={18} />
          </button>
        }
      />
      <div className="ux-wb-title">
        <strong>{isUnitDetail ? props.selectedUnit.name : props.roster.name}</strong>
        <small>{isUnitDetail ? `${props.selectedSection.name} · ${remainingLabel}` : `${props.roster.faction} · ${props.roster.system}`}</small>
      </div>
      {isUnitDetail ? (
        <span className="ux-wb-header-points" aria-label={`${props.selectedUnit.points} points`}>
          <b>{props.selectedUnit.points}</b>
          <small>pts</small>
        </span>
      ) : (
        <button type="button" className="ux-icon-btn" aria-label="Export" onClick={() => props.onNavigate("export")}>
          <Download size={18} />
        </button>
      )}
      {isUnitDetail ? (
        <span className="ux-detail-progress" role="progressbar" aria-label="Roster points used" aria-valuemin={0} aria-valuemax={props.roster.pointsLimit} aria-valuenow={props.roster.pointsUsed}>
          <i style={{ width: `${progress}%` }} />
        </span>
      ) : null}
    </header>
  );
}

function Tree({ props }: { props: ConceptProps }) {
  return (
    <nav className="ux-wb-tree" aria-label="Roster tree">
      <div className="ux-wb-search">
        <Search size={15} />
        <input placeholder="Filter units" readOnly />
      </div>
      {props.roster.sections.map((section) => {
        const open = props.expandedSectionIds.includes(section.id) || section.id === props.selectedSectionId;
        return (
          <div className={`ux-tree-branch ${open ? "open" : ""}`} key={section.id}>
            <button type="button" className="ux-tree-section" onClick={() => props.onSelectSection(section.id)}>
              <ChevronDown size={14} className="ux-tree-caret" />
              <strong>{section.name}</strong>
              <small>{section.required ?? section.units.length}</small>
            </button>
            {open ? (
              <div className="ux-tree-units">
                {section.units.map((unit) => (
                  <button
                    key={unit.id}
                    type="button"
                    className={`ux-tree-unit ${unit.status ?? "valid"} ${props.selectedUnit.id === unit.id ? "active" : ""}`}
                    onClick={() => props.onSelectUnit(unit.id)}
                  >
                    <span className="ux-tree-rail" aria-hidden />
                    <span className="ux-tree-unit-main">
                      <span>{unit.name}</span>
                      <small>×{unit.count}</small>
                    </span>
                    {unit.status && unit.status !== "valid" ? <StatusGlyph status={unit.status} size={13} /> : <b>{unit.points}</b>}
                  </button>
                ))}
                <button
                  type="button"
                  className="ux-tree-add"
                  onClick={() => {
                    props.onSelectSection(section.id);
                    props.onNavigate("add-unit");
                  }}
                >
                  <Plus size={13} />
                  Add unit
                </button>
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}

function Detail({ props, scrollRef, onOpenLoadoutSlot }: { props: ConceptProps; scrollRef: RefObject<HTMLElement | null>; onOpenLoadoutSlot: (groupId: string, slotId: string) => void }) {
  if (props.screen === "add-unit") return <AddPane props={props} />;
  const unit = props.selectedUnit;
  return (
    <section className="ux-wb-detail" ref={scrollRef}>
      <div className="ux-keywords">
        {unit.keywords.map((k) => (
          <Chip key={k} tone="cool">
            {k}
          </Chip>
        ))}
      </div>
      {unit.note ? <p className="ux-config-note">{unit.note}</p> : null}
      {props.unitDetailView === "profile" ? <UnitProfile props={props} /> : unit.detail ? <StructuredOptions props={props} onOpenLoadoutSlot={onOpenLoadoutSlot} /> : <FlatOptions props={props} />}
    </section>
  );
}

function StructuredOptions({ props, onOpenLoadoutSlot }: { props: ConceptProps; onOpenLoadoutSlot: (groupId: string, slotId: string) => void }) {
  const unit = props.selectedUnit;
  const detail = unit.detail;
  const [expandedGroupIds, setExpandedGroupIds] = useState<string[]>(["sergeant-group"]);
  if (!detail) return <FlatOptions props={props} />;
  const totalModels = detail.loadoutGroups.reduce((sum, group) => sum + group.count, 0);

  const toggleGroup = (groupId: string) => {
    setExpandedGroupIds((current) => current.includes(groupId) ? current.filter((id) => id !== groupId) : [...current, groupId]);
  };

  return (
    <div className="ux-unit-options">
      <section className="ux-unit-option-section">
        <h4>Model loadouts</h4>
        {detail.loadoutGroups.map((group) => {
          const slotChoices = group.slots.map((slot) => slot.choices.find((choice) => choice.id === slot.selectedChoiceId)).filter(Boolean);
          const groupPoints = group.count * (group.basePointsPerModel + slotChoices.reduce((sum, choice) => sum + (choice?.points ?? 0), 0));
          const groupName = group.count === 1 && group.name.endsWith("ies") ? `${group.name.slice(0, -3)}y` : group.name;
          const expanded = expandedGroupIds.includes(group.id);
          return (
            <article className={`ux-loadout-group ${expanded ? "expanded" : ""}`} key={group.id}>
              <header className="ux-loadout-group-head">
                <button type="button" className="ux-loadout-group-toggle" aria-expanded={expanded} onClick={() => toggleGroup(group.id)}>
                  <span>
                    <strong>{groupName} ×{group.count}</strong>
                    <small>{slotChoices.map((choice) => choice?.name).join(" · ")}</small>
                  </span>
                  <span className="ux-loadout-group-meta">
                    <small>{groupPoints} pts</small>
                    <ChevronDown size={15} />
                  </span>
                </button>
                {group.canSplit ? (
                  <div className="ux-loadout-group-actions">
                    <div className="ux-loadout-count-controls">
                      <button type="button" aria-label={`Decrease ${groupName} count`} disabled={group.count <= 1} onClick={() => props.onLoadoutGroupCountChange(unit.id, group.id, -1)}><Minus size={13} /></button>
                      <strong aria-label={`${group.count} models`}>{group.count}</strong>
                      <button type="button" aria-label={`Increase ${groupName} count`} disabled={totalModels >= (unit.maxCount ?? Number.POSITIVE_INFINITY)} onClick={() => props.onLoadoutGroupCountChange(unit.id, group.id, 1)}><Plus size={13} /></button>
                    </div>
                    <button type="button" className="ux-loadout-split" aria-label={`Split one ${groupName}`} title="Split one model into a new group" disabled={group.count <= 1} onClick={() => props.onSplitLoadoutGroup(unit.id, group.id)}>
                      <Split size={14} />
                    </button>
                  </div>
                ) : null}
              </header>
              {expanded ? <div className="ux-loadout-slots">
                {group.slots.map((slot) => {
                  const choice = slot.choices.find((item) => item.id === slot.selectedChoiceId);
                  if (!choice) return null;
                  return (
                    <button type="button" className="ux-loadout-slot" key={slot.id} onClick={() => onOpenLoadoutSlot(group.id, slot.id)}>
                      <small>{slot.label}</small>
                      <strong>{choice.name}</strong>
                      <em>{choice.points ? `+${choice.points} pts` : "Included"}</em>
                      <ChevronRight size={15} />
                    </button>
                  );
                })}
              </div> : null}
            </article>
          );
        })}
      </section>

      {detail.choiceGroups.map((group) => (
        <section className="ux-unit-option-section" key={group.id}>
          <div className="ux-option-section-title">
            <h4>{group.title}</h4>
            <small>{group.optionIds.filter((optionId) => unit.options.find((option) => option.id === optionId)?.selected).length}/{group.optionIds.length} selections</small>
          </div>
          {group.optionIds.map((optionId) => {
            const option = unit.options.find((item) => item.id === optionId);
            return option ? <OptionButton key={option.id} option={option} onToggle={props.onToggleOption} /> : null;
          })}
        </section>
      ))}

      <section className="ux-unit-option-section">
        <h4>Rules & equipment</h4>
        {detail.standaloneOptionIds.map((optionId) => {
          const option = unit.options.find((item) => item.id === optionId);
          return option ? <OptionButton key={option.id} option={option} onToggle={props.onToggleOption} /> : null;
        })}
      </section>
    </div>
  );
}

function LoadoutSelector({ props, target, onClose }: { props: ConceptProps; target: { groupId: string; slotId: string }; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const group = props.selectedUnit.detail?.loadoutGroups.find((item) => item.id === target.groupId);
  const slot = group?.slots.find((item) => item.id === target.slotId);
  const choices = slot?.choices.filter((choice) => choice.name.toLowerCase().includes(query.trim().toLowerCase())) ?? [];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (!group || !slot) return null;
  const groupName = group.count === 1 && group.name.endsWith("ies") ? `${group.name.slice(0, -3)}y` : group.name;
  return (
    <div className="ux-loadout-selector-layer" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="ux-loadout-selector" role="dialog" aria-modal="true" aria-labelledby="loadout-selector-title">
        <header>
          <span>
            <strong id="loadout-selector-title">Choose {slot.label.toLowerCase()}</strong>
            <small>{groupName} ×{group.count}</small>
          </span>
          <button type="button" aria-label="Close selector" onClick={onClose}><X size={18} /></button>
        </header>
        <label className="ux-loadout-selector-search">
          <Search size={15} />
          <input value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder={`Search ${slot.label.toLowerCase()} choices`} autoFocus />
        </label>
        <div className="ux-loadout-choice-list">
          {choices.length ? choices.map((choice) => {
            const selected = choice.id === slot.selectedChoiceId;
            return (
              <button type="button" className={`ux-loadout-choice ${selected ? "selected" : ""}`} key={choice.id} onClick={() => {
                props.onSelectLoadoutChoice(props.selectedUnit.id, group.id, slot.id, choice.id);
                onClose();
              }}>
                <span>
                  <strong>{choice.name}</strong>
                  <small>{choice.points ? `+${choice.points} pts per model` : "Included"}</small>
                </span>
                <span className="ux-loadout-choice-check" aria-hidden>{selected ? <Check size={15} /> : null}</span>
              </button>
            );
          }) : (
            <div className="ux-loadout-selector-empty">
              <Search size={18} />
              <strong>No matching choices</strong>
              <small>Try a different weapon name.</small>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function FlatOptions({ props }: { props: ConceptProps }) {
  const unit = props.selectedUnit;
  return (
    <div className="ux-opt-groups">
      {(["weapon", "upgrade", "rule"] as const).map((group) => {
        const options = unit.options.filter((option) => option.group === group);
        if (!options.length) return null;
        return (
          <section className="ux-opt-group" key={group}>
            <h4>{group === "weapon" ? "Wargear" : group === "upgrade" ? "Upgrades" : "Special rules"}</h4>
            {options.map((option) => <OptionButton key={option.id} option={option} onToggle={props.onToggleOption} />)}
          </section>
        );
      })}
    </div>
  );
}

function OptionButton({ option, onToggle }: { option: ConceptProps["selectedUnit"]["options"][number]; onToggle: (id: string) => void }) {
  return (
    <button type="button" className={`ux-opt-row ${option.selected ? "on" : ""}`} onClick={() => onToggle(option.id)}>
      <span className="ux-opt-check" aria-hidden />
      <span>{option.name}</span>
      <em>{priceLabel(option.points)}</em>
    </button>
  );
}

function UnitProfile({ props }: { props: ConceptProps }) {
  const unit = props.selectedUnit;
  const detail = unit.detail;
  if (!detail) {
    return (
      <div className="ux-empty small">
        <BookOpen size={18} />
        <strong>Profile unavailable</strong>
        <small>This unit only has configuration data in the draft.</small>
      </div>
    );
  }

  const modelTable = detail.profileTables.find((table) => table.id === "model-profile");
  const weaponTables = detail.profileTables.filter((table) => table.id !== "model-profile").map((table) => {
    const aggregated = new Map<string, { name: string; count: number; values: string[] }>();
    detail.loadoutGroups.forEach((group) => {
      group.slots.filter((slot) => slot.profileTableId === table.id).forEach((slot) => {
        const choice = slot.choices.find((item) => item.id === slot.selectedChoiceId);
        if (!choice) return;
        const current = aggregated.get(choice.id);
        aggregated.set(choice.id, { name: choice.name, count: (current?.count ?? 0) + group.count, values: choice.profileValues });
      });
    });
    return {
      ...table,
      rows: Array.from(aggregated.entries()).map(([id, entry]) => ({ id: `${table.id}-${id}`, name: `${entry.name} (x${entry.count})`, values: entry.values })),
    };
  });
  return (
    <div className="ux-unit-profile">
      <ProfileSection title="Models" open>
        <div className="ux-profile-models">
          {detail.loadoutGroups.map((group) => {
            const summary = group.slots.map((slot) => slot.choices.find((choice) => choice.id === slot.selectedChoiceId)?.name).filter(Boolean).join(", ");
            const groupName = group.count === 1 && group.name.endsWith("ies") ? `${group.name.slice(0, -3)}y` : group.name;
            return (
              <div className="ux-profile-model" key={group.id}>
                <b>{group.count}x</b>
                <span>
                  <strong>{groupName}</strong>
                  <small>{summary}</small>
                </span>
              </div>
            );
          })}
        </div>
      </ProfileSection>

      {modelTable ? (
        <ProfileSection title="Profile" open>
          <ProfileTable table={modelTable} unitCount={unit.count} />
        </ProfileSection>
      ) : null}

      <ProfileSection title="Traits">
        <div className="ux-profile-tag-list">{detail.traits.map((trait) => <span key={trait}>{trait}</span>)}</div>
      </ProfileSection>

      {weaponTables.map((table) => (
        <ProfileSection title={table.title} key={table.id}>
          <ProfileTable table={table} unitCount={unit.count} />
        </ProfileSection>
      ))}

      <ProfileSection title="Wargear">
        <div className="ux-profile-copy-list">
          {detail.wargear.map((item) => (
            <article key={item.id}>
              <strong>{item.name}</strong>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </ProfileSection>

      <ProfileSection title="Rules">
        <div className="ux-profile-tag-list">{detail.rules.map((rule) => <span key={rule}>{rule}</span>)}</div>
      </ProfileSection>

      <ProfileSection title="Categories">
        <div className="ux-profile-tag-list">{detail.categories.map((category) => <span key={category}>{category}</span>)}</div>
      </ProfileSection>
    </div>
  );
}

function ProfileSection({ title, open = false, children }: { title: string; open?: boolean; children: ReactNode }) {
  return (
    <details className="ux-profile-section" open={open}>
      <summary>
        <strong>{title}</strong>
        <ChevronDown size={15} />
      </summary>
      <div className="ux-profile-section-body">{children}</div>
    </details>
  );
}

function ProfileTable({ table, unitCount }: { table: NonNullable<ConceptProps["selectedUnit"]["detail"]>["profileTables"][number]; unitCount: number }) {
  const rowName = (row: typeof table.rows[number]) => row.id === "assault-legionary" ? `Assault Legionary (x${unitCount - 1})` : row.name.replace("(x10)", `(x${unitCount})`);
  return (
    <div className="ux-profile-table-scroll">
      <table className="ux-profile-table">
        <thead>
          <tr>
            {table.columns.map((column) => <th scope="col" key={column}>{column}</th>)}
          </tr>
        </thead>
        {table.rows.map((row) => (
          <tbody className="ux-profile-row-group" key={row.id}>
            <tr className="ux-profile-row-name">
              <th scope="rowgroup" colSpan={table.columns.length}>
                <strong>{rowName(row)}</strong>
                {row.tags ? <small>{row.tags.join(" · ")}</small> : null}
              </th>
            </tr>
            <tr className="ux-profile-row-stats">
              {row.values.map((value, index) => <td key={`${row.id}-${table.columns[index]}`}>{value}</td>)}
            </tr>
          </tbody>
        ))}
      </table>
    </div>
  );
}

function AddPane({ props }: { props: ConceptProps }) {
  const pool = flattenUnits(props.roster).filter((u) => u.sectionId === props.selectedSectionId);
  const smart = props.smartSearch ?? false;
  const section = props.selectedSection.name;
  const suggestions = [`legal ${section.toLowerCase()} under 120`, "fills this slot", "best value pick"];
  return (
    <section className="ux-wb-detail">
      <button type="button" className="ux-wb-back" onClick={props.onBack}>
        <ArrowLeft size={14} />
        Back to roster
      </button>
      <div className="ux-wb-detail-head">
        <span>
          <small>Add to</small>
          <strong>{section}</strong>
        </span>
        <PanelsTopLeft size={20} />
      </div>
      <div className={`ux-wb-search ${smart ? "smart" : ""}`}>
        {smart ? <Command size={15} /> : <Search size={15} />}
        <input placeholder={smart ? `Add a legal ${section} unit or ask…` : `Search ${section}`} readOnly />
      </div>
      {smart ? (
        <div className="ux-suggest">
          <Sparkles size={14} />
          <div className="ux-suggest-chips">
            {suggestions.map((s) => (
              <button key={s} type="button" className="ux-suggest-chip">
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div className="ux-pool">
        {(pool.length ? pool : flattenUnits(props.roster)).map((unit) => (
          <button key={unit.id} type="button" className="ux-pool-row" onClick={() => props.onSelectUnit(unit.id)}>
            <span>
              <strong>{unit.name}</strong>
              <small>{unit.role}</small>
            </span>
            <span className="ux-pool-meta">
              <b>{unit.points} pts</b>
              <Chip tone={unit.availability === "available" ? "valid" : unit.availability === "limited" ? "warning" : "error"}>{unit.availability}</Chip>
            </span>
            <Plus size={16} />
          </button>
        ))}
      </div>
    </section>
  );
}

function Rail({ props }: { props: ConceptProps }) {
  const checks = rosterChecks(props.roster);
  return (
    <aside className="ux-wb-rail">
      <div className="ux-wb-rail-head">
        <AlertTriangle size={15} />
        <strong>Validation</strong>
        <span className="ux-wb-rail-count">{checks.length}</span>
      </div>
      {checks.length === 0 ? (
        <div className="ux-empty small">
          <StatusGlyph status="valid" size={18} />
          <small>Roster is legal</small>
        </div>
      ) : (
        checks.map((unit) => (
          <button key={unit.id} type="button" className={`ux-rail-item ${unit.status}`} onClick={() => props.onSelectUnit(unit.id)}>
            <StatusGlyph status={unit.status} size={15} />
            <span>
              <strong>{unit.name}</strong>
              <small>{unit.note ?? unit.slotImpact}</small>
            </span>
          </button>
        ))
      )}
      <div className="ux-wb-rail-foot">
        <span>{flattenUnits(props.roster).length} units</span>
        <span>{props.roster.sections.length} slots</span>
      </div>
    </aside>
  );
}

/** Library / home entry screen ("Main screen"). */
function Library({ props }: { props: ConceptProps }) {
  const recents = [
    { name: props.roster.name, sub: props.roster.faction, pts: `${props.roster.pointsUsed}/${props.roster.pointsLimit}` },
    { name: "Incursion Test List", sub: "Saved roster", pts: "500/1000" },
    { name: "Narrative Boarding Patrol", sub: "Saved roster", pts: "490/500" },
  ];
  return (
    <>
      <header className="ux-wb-top ux-wb-home-top">
        <div className="ux-wb-title">
          <strong>Roster Builder</strong>
          <small>{props.roster.system}</small>
        </div>
        <button type="button" className="ux-icon-btn" aria-label="Settings" onClick={() => props.onNavigate("settings")}>
          <Cog size={18} />
        </button>
      </header>
      <div className="ux-wb-home-body">
        <div className="ux-cmd-hero">
          <Wand2 size={20} />
          <h2>What do you want to build?</h2>
          <p>Open a recent list or start fresh. Tap a roster to drop into the workbench.</p>
        </div>
        <button type="button" className="ux-new-roster" onClick={() => props.onNavigate("system")}>
          <Plus size={22} />
          <span>
            <strong>New roster</strong>
            <small>Pick a system and faction</small>
          </span>
        </button>
        <div className="ux-result-label">Recent</div>
        {recents.map((r) => (
          <button key={r.name} type="button" className="ux-list-card" onClick={() => props.onNavigate("overview")}>
            <span>
              <strong>{r.name}</strong>
              <small>{r.sub}</small>
            </span>
            <b>{r.pts}</b>
          </button>
        ))}
      </div>
    </>
  );
}

/** Roster creation flow ("Roster creation"). */
function CreateScreen({ props }: { props: ConceptProps }) {
  const systems = [
    {
      name: "Warhammer 40,000",
      sub: "Matched play · Incursion to Onslaught",
      groups: [
        { label: "Imperium", forces: ["Adeptus Astartes", "Astra Militarum", "Adepta Sororitas", "Adeptus Custodes"] },
        { label: "Xenos", forces: ["Aeldari", "Necrons", "T'au Empire", "Tyranids"] },
        { label: "Chaos", forces: ["Chaos Space Marines", "Death Guard", "World Eaters", "Thousand Sons"] },
      ],
    },
    {
      name: "Horus Heresy",
      sub: "Age of Darkness · Crusade armies",
      groups: [
        { label: "Legiones Astartes", forces: ["Dark Angels", "Sons of Horus", "Imperial Fists", "Emperor's Children"] },
        { label: "Auxilia", forces: ["Solar Auxilia", "Mechanicum", "Talons of the Emperor"] },
      ],
    },
    {
      name: "Age of Sigmar",
      sub: "Battlepack · Spearhead to Battlehost",
      groups: [
        { label: "Grand Alliances", forces: ["Stormcast Eternals", "Soulblight Gravelords", "Orruk Warclans", "Seraphon"] },
        { label: "Chaos", forces: ["Slaves to Darkness", "Disciples of Tzeentch", "Blades of Khorne"] },
      ],
    },
  ];
  const points = ["1000", "2000", "3000"];
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [selectedPoints, setSelectedPoints] = useState<string | null>(null);
  const [customPoints, setCustomPoints] = useState("1500");
  const [selectedForce, setSelectedForce] = useState<string | null>(null);
  const [forceOpen, setForceOpen] = useState(false);
  const system = systems.find((item) => item.name === selectedSystem);
  const resolvedPoints = selectedPoints === "custom" ? customPoints : selectedPoints;
  const hasPoints = Boolean(resolvedPoints && Number(resolvedPoints) > 0);

  function chooseSystem(name: string) {
    setSelectedSystem(name);
    setSelectedPoints(null);
    setSelectedForce(null);
    setForceOpen(false);
  }

  function choosePoints(value: string) {
    setSelectedPoints(value);
    setSelectedForce(null);
    setForceOpen(false);
  }

  return (
    <>
      <header className="ux-wb-top ux-wb-home-top reversed">
        <button type="button" className="ux-icon-btn" aria-label="Back" onClick={props.onBack}>
          <ArrowLeft size={18} />
        </button>
        <div className="ux-wb-title">
          <strong>New roster</strong>
          <small>Pick system, faction & size</small>
        </div>
      </header>
      <div className="ux-wb-home-body">
        <div className="ux-start-group">
          <h4>Game system</h4>
          {systems.map(({ name, sub }) => (
            <button key={name} type="button" className={`ux-start-row ${selectedSystem === name ? "on" : ""}`} onClick={() => chooseSystem(name)}>
              <span>
                <strong>{name}</strong>
                <small>{sub}</small>
              </span>
              {selectedSystem === name ? <Check size={18} /> : null}
            </button>
          ))}
        </div>

        {selectedSystem ? (
          <div className="ux-start-group ux-start-step">
            <h4>Points limit</h4>
            <div className="ux-filter-row">
              {points.map((value) => (
                <button key={value} type="button" className={`ux-filter-pill ${selectedPoints === value ? "on" : ""}`} onClick={() => choosePoints(value)}>
                  {value} pts
                </button>
              ))}
              <button type="button" className={`ux-filter-pill ${selectedPoints === "custom" ? "on" : ""}`} onClick={() => choosePoints("custom")}>
                Custom
              </button>
            </div>
            {selectedPoints === "custom" ? (
              <label className="ux-custom-points">
                <input
                  value={customPoints}
                  inputMode="numeric"
                  aria-label="Custom points limit"
                  onChange={(event) => {
                    setCustomPoints(event.currentTarget.value.replace(/\D/g, "").slice(0, 5));
                    setSelectedForce(null);
                    setForceOpen(false);
                  }}
                />
                <span>pts</span>
              </label>
            ) : null}
          </div>
        ) : null}

        {system && hasPoints ? (
          <div className="ux-start-group ux-start-step">
            <h4>Force</h4>
            <div className="ux-select-field-wrap">
              <button type="button" className={`ux-select-field ${forceOpen ? "open" : ""}`} onClick={() => setForceOpen((value) => !value)}>
                <span>
                  <strong>{selectedForce ?? "Select force"}</strong>
                  <small>{selectedForce ? `${selectedSystem} · ${resolvedPoints} pts` : "Choose from available armies"}</small>
                </span>
                <ChevronDown size={16} />
              </button>
              {forceOpen ? (
                <div className="ux-select-popover">
                  <div className="ux-wb-search">
                    <Search size={15} />
                    <input placeholder="Search forces" readOnly />
                  </div>
                  {system.groups.map((group, index) => (
                    <details key={group.label} className="ux-force-group" open={index === 0}>
                      <summary>
                        <span>{group.label}</span>
                        <ChevronDown size={14} />
                      </summary>
                      <div>
                        {group.forces.map((force) => (
                          <button
                            key={force}
                            type="button"
                            className={`ux-force-option ${selectedForce === force ? "on" : ""}`}
                            onClick={() => {
                              setSelectedForce(force);
                              setForceOpen(false);
                            }}
                          >
                            <span>{force}</span>
                            {selectedForce === force ? <Check size={15} /> : null}
                          </button>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <button type="button" className="ux-primary" disabled={!selectedSystem || !hasPoints || !selectedForce} onClick={() => props.onNavigate("overview")}>
          <Plus size={16} />
          Create roster
        </button>
      </div>
    </>
  );
}

/** Quick source lookup for units, rules, wargear, and keywords. */
function LookupScreen({ props }: { props: ConceptProps }) {
  const units = flattenUnits(props.roster).slice(0, 4);
  const rules = [
    { name: "Oath of Moment", sub: "Army rule", tag: "Core" },
    { name: "Deep Strike", sub: "Deployment ability", tag: "Keyword" },
    { name: "Invulnerable Save", sub: "Defensive rule", tag: "Rule" },
  ];
  const wargear = flattenUnits(props.roster)
    .flatMap((unit) => unit.options.filter((option) => option.group !== "rule").map((option) => ({ ...option, unit: unit.name })))
    .slice(0, 3);

  return (
    <>
      <header className="ux-wb-top ux-wb-home-top">
        <div className="ux-wb-title">
          <strong>Lookup</strong>
          <small>Sources, units & rules</small>
        </div>
        <button type="button" className="ux-icon-btn" aria-label="Settings" onClick={() => props.onNavigate("settings")}>
          <Cog size={18} />
        </button>
      </header>
      <div className="ux-wb-home-body">
        <div className={`ux-wb-search ${props.smartSearch ? "smart" : ""}`}>
          {props.smartSearch ? <Command size={15} /> : <Search size={15} />}
          <input placeholder="Search Assault Squad, Deep Strike, plasma..." readOnly />
        </div>
        <div className="ux-source-filters">
          {["All sources", props.roster.system, props.roster.faction, "Core rules"].map((filter, index) => (
            <button key={filter} type="button" className={`ux-filter-pill ${index === 0 ? "on" : ""}`}>
              {filter}
            </button>
          ))}
        </div>
        <LookupGroup title="Units" icon={<BookOpen size={15} />}>
          {units.map((unit) => (
            <button key={unit.id} type="button" className="ux-lookup-row" onClick={() => props.onSelectUnit(unit.id)}>
              <span>
                <strong>{unit.name}</strong>
                <small>{unit.sectionName} · {unit.role}</small>
              </span>
              <b>{unit.points} pts</b>
            </button>
          ))}
        </LookupGroup>
        <LookupGroup title="Rules" icon={<ClipboardList size={15} />}>
          {rules.map((rule) => (
            <button key={rule.name} type="button" className="ux-lookup-row">
              <span>
                <strong>{rule.name}</strong>
                <small>{rule.sub}</small>
              </span>
              <Chip tone="cool">{rule.tag}</Chip>
            </button>
          ))}
        </LookupGroup>
        <LookupGroup title="Wargear" icon={<Hammer size={15} />}>
          {wargear.map((item) => (
            <button key={`${item.unit}-${item.id}`} type="button" className="ux-lookup-row">
              <span>
                <strong>{item.name}</strong>
                <small>{item.unit}</small>
              </span>
              <b>{priceLabel(item.points)}</b>
            </button>
          ))}
        </LookupGroup>
      </div>
    </>
  );
}

function LookupGroup({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="ux-lookup-group">
      <div className="ux-lookup-title">
        {icon}
        <strong>{title}</strong>
      </div>
      {children}
    </section>
  );
}

/** Utility hub for roster-building extras. */
function ToolsScreen({ props }: { props: ConceptProps }) {
  const checks = rosterChecks(props.roster);
  const tools = [
    { icon: <ShieldCheck size={18} />, title: checks.length ? `${checks.length} checks to resolve` : "Roster is legal", sub: `${props.roster.pointsLimit - props.roster.pointsUsed} points open`, action: () => props.onNavigate("validation") },
    { icon: <Share2 size={18} />, title: "Export & share", sub: "Copy list, print, or hand off", action: () => props.onNavigate("export") },
    { icon: <StickyNote size={18} />, title: "Matchup notes", sub: "Game plan and reminders", action: undefined },
    { icon: <Star size={18} />, title: "Pinned rules", sub: "Oath of Moment, Deep Strike", action: () => props.onNavigate("catalogue") },
  ];

  return (
    <>
      <header className="ux-wb-top ux-wb-home-top">
        <div className="ux-wb-title">
          <strong>Tools</strong>
          <small>{props.roster.name}</small>
        </div>
        <button type="button" className="ux-icon-btn" aria-label="Roster" onClick={() => props.onNavigate("overview")}>
          <Layers size={18} />
        </button>
      </header>
      <div className="ux-wb-home-body">
        <div className="ux-tools-summary">
          <BudgetMeter roster={props.roster} label="Current list" />
          <div>
            <strong>{flattenUnits(props.roster).length} units</strong>
            <small>{props.roster.sections.length} roster sections</small>
          </div>
        </div>
        <div className="ux-tools-grid">
          {tools.map((tool) => (
            <button key={tool.title} type="button" className="ux-tool-tile" onClick={tool.action}>
              <span className="ux-setting-icon">{tool.icon}</span>
              <span>
                <strong>{tool.title}</strong>
                <small>{tool.sub}</small>
              </span>
            </button>
          ))}
        </div>
        <section className="ux-tools-panel">
          <div className="ux-lookup-title">
            <ClipboardList size={15} />
            <strong>Table-side checklist</strong>
          </div>
          {["Confirm detachment rules", "Mark fixed secondary plan", "Review wargear swaps"].map((item, index) => (
            <button key={item} type="button" className={`ux-source-row ${index === 0 ? "on" : ""}`}>
              <span className="ux-opt-check" aria-hidden />
              <span>
                <strong>{item}</strong>
                <small>{index === 0 ? "Ready for review" : "Saved for later"}</small>
              </span>
            </button>
          ))}
        </section>
      </div>
    </>
  );
}

/** Settings screen housing the "Smart search & suggestions" toggle and sources. */
function SettingsScreen({ props }: { props: ConceptProps }) {
  const smart = props.smartSearch ?? false;
  const sources = mockCatalogues.map((source, index) => ({
    ...source,
    system: index === 0 ? props.roster.system : "Warhammer 40,000",
    imported: index === 0 ? "Imported today" : index === 1 ? "Updated 2 days ago" : "Needs review",
  }));
  return (
    <>
      <header className="ux-wb-top ux-wb-home-top reversed">
        <button type="button" className="ux-icon-btn" aria-label="Back" onClick={props.onBack}>
          <ArrowLeft size={18} />
        </button>
        <div className="ux-wb-title">
          <strong>Settings</strong>
          <small>Tune your builder</small>
        </div>
      </header>
      <div className="ux-wb-home-body">
        <div className="ux-result-label">Search & assistance</div>
        <button type="button" className={`ux-setting-row ${smart ? "on" : ""}`} onClick={props.onToggleSmartSearch}>
          <span className="ux-setting-icon">
            <Sparkles size={17} />
          </span>
          <span className="ux-setting-text">
            <strong>Smart search & suggestions</strong>
            <small>Type-to-add command bar, fuzzy results, and AI suggestion chips in the add-unit menu.</small>
          </span>
          <span className="ux-switch" aria-hidden />
        </button>
        <p className="ux-hint">
          <Sparkles size={14} />
          When on, the add-unit menu offers quick suggestions for the current slot. With the top-bar layout it also shows a floating command bar.
        </p>
        <details className="ux-source-section" open>
          <summary>
            <span>
              <Database size={16} />
              <strong>Sources</strong>
            </span>
            <ChevronDown size={16} />
          </summary>
          <button type="button" className="ux-import-source">
            <FileInput size={18} />
            <span>
              <strong>Import source</strong>
              <small>Add catalogue files or rules packs</small>
            </span>
          </button>
          <div className="ux-source-list">
            {sources.map((source) => (
              <button key={source.id} type="button" className={`ux-source-row ${source.status === "Current" ? "on" : ""}`}>
                <span>
                  <strong>{source.name}</strong>
                  <small>{source.system} · {source.imported}</small>
                </span>
                <Chip tone={source.status === "Current" ? "valid" : "warning"}>{source.updated}</Chip>
              </button>
            ))}
          </div>
        </details>
      </div>
    </>
  );
}

/** Bottom / floating main tab bar. */
function TabBar({ props }: { props: ConceptProps }) {
  const floating = props.navStyle === "floating";
  const screen = props.screen;
  const items = [
    { id: "library", label: "Lists", icon: LibraryBig },
    { id: "catalogue", label: "Lookup", icon: Search },
    { id: "tools", label: "Tools", icon: Hammer },
    { id: "settings", label: "Settings", icon: Cog },
  ] as const;

  const isActive = (id: string) => {
    if (id === "library") return screen === "library" || screen === "overview" || screen === "unit-detail" || screen === "system" || screen === "add-unit" || screen === "validation";
    return screen === id;
  };

  return (
    <nav className={`ux-tabbar ${floating ? "floating" : ""}`} aria-label="Main navigation">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <Fragment key={item.id}>
            {index === 2 ? (
              <button
                type="button"
                className={`ux-tab ux-tab-fab ${screen === "add-unit" ? "active" : ""}`}
                aria-label="Add unit"
                onClick={() => props.onNavigate("add-unit")}
              >
                <Plus size={22} />
              </button>
            ) : null}
            <button key={item.id} type="button" className={`ux-tab ${isActive(item.id) ? "active" : ""}`} onClick={() => props.onNavigate(item.id)}>
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          </Fragment>
        );
      })}
    </nav>
  );
}

/** Floating command bar, shown only with the top-bar layout when smart search is on. */
function CommandBar({ props }: { props: ConceptProps }) {
  return (
    <div className="ux-cmd-bar">
      <button type="button" className="ux-cmd-tab" aria-label="Build" onClick={() => props.onNavigate("overview")}>
        <Layers size={18} />
      </button>
      <button type="button" className="ux-cmd-input" onClick={() => props.onNavigate("add-unit")}>
        <Command size={16} />
        <span>Add unit or ask for help…</span>
      </button>
      <button type="button" className="ux-cmd-send" aria-label="Run" onClick={() => props.onNavigate("add-unit")}>
        <ArrowUp size={18} />
      </button>
    </div>
  );
}
