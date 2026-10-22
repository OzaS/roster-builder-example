import { DesktopElements } from "../concepts/desktop/DesktopWorkbench";
import { TabletElements } from "../concepts/tablet/TabletElements";
import { LibrarySwitch } from "./LibrarySwitch";
import { AppearancePreferences } from "../concepts/ux/AppearanceSettings";
import { MobileUnitOptions, ModelStackSamples, OptionFoldSamples } from "../concepts/ux/MobileUnitOptions";
import { AlertTriangle, Archive, ArrowLeft, ArrowUp, BarChart3, BookOpen, Check, ChevronDown, ChevronLeft, ChevronRight, Circle, CircleDot, Cog, Coins, Command, Copy, Database, Dice5, Download, Ellipsis, FileInput, Gamepad2, GripVertical, Hammer, Heart, ImagePlus, Languages, Layers, LibraryBig, Maximize2, MessageCircle, Minus, Moon, MoveRight, Palette, PanelsTopLeft, Pencil, Plus, RotateCcw, Rows3, Scale, Search, Smartphone, Sparkles, Split, Trash2, Upload, UserRound, Wand2, X, SquareCheck } from "lucide-react";
import { createContext, useContext, useState } from "react";
import { PhoneStatusBar } from "../components/DeviceFrame";
import { mockRosterReferences, referenceById } from "../data/mockRosterReferences";
import type { DesignElementGroup, DesignElements } from "../design-data/designData";
import type { ColorScheme, PlatformPreview, Roster, RosterSection, RosterUnit, ThemeMode } from "../types";
import { BudgetMeter, Chip, ExpandableBudget, RosterMoreMenu, RosterShareButton, TreeUnitMain, countSections, flattenUnits, priceLabel, rosterChecks, shellClass, StatusGlyph, SubscriptionGate } from "../concepts/ux/uxShared";
import type { GalleryConcept } from "./galleryTypes";
import { ComingSoonCard, DeveloperOptionsPreview } from "../concepts/ux/AppExtras";
import { ActionMenuDialog, AddCollectionSheet, LOCAL_ERRORS, LOCAL_FILE, LOCAL_SOURCE, LocalImportChoiceDialog, LocalImportError, LocalImportRow, LocalInterruptedNotice, LocalRefusedNotice, LocalSourceNote, LocalSourceRows, localSteps, AdvancedInstallSetting, AppDialog, AutoUpdateChecksSetting, ImportReportGroups, CollectionMenuDialog, CollectionSourceRow, DefaultListingRows, FactionPicker, DEFAULT_COLLECTION, DefaultCollectionCard, EXAMPLE_SOURCES, EXAMPLE_SYSTEM, installSteps, KeepVersionsSetting, UserCollectionRows, JobModal, JobOutcomeNotice, JobPill, JobToast, LastUpdateCard, MigrationReportBody, MobileDataNotice, NotificationsSetting, OlderVersionRow, OpenedWithVersionNotice, OsJobNotifications, ReadOnlyBanner, ReadOnlyChips, ReadOnlyExportSheet, RememberSectionsSetting, RemoveSourceAlert, DeleteVersionAlert, StoredOutline, StoredTotals, RosterDataTag, SourceRow, SourceStatusChip, SourceUpdateCard, SourceVersions, SourcesNavRow, TaggedRosterRows, UpdateAvatarButton, UpdatesNotice, WifiOnlySetting, WifiWaitNotice } from "../concepts/ux/SourceJobs";

type Props = {
  concept: GalleryConcept;
  platform: PlatformPreview;
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  roster: Roster;
  selectedSection: RosterSection;
  selectedUnit: RosterUnit;
  selectedSectionId: string;
  onSelectSection: (id: string) => void;
  onSelectUnit: (id: string) => void;
  onToggleOption: (id: string) => void;
  onCountChange: (id: string, delta: number) => void;
  elements: DesignElements;
};

export function DesignElementsPanel({
  concept,
  platform,
  themeMode,
  colorScheme,
  roster,
  selectedSection,
  selectedUnit,
  selectedSectionId,
  onSelectSection,
  onSelectUnit,
  onToggleOption,
  elements,
}: Props) {
  if (concept.id === "desktop-workbench") return <DesktopElements />;
  if (concept.id === "tablet-workbench") return <TabletElements />;
  const rootClass = `design-elements-panel ux-screen ux-workbench ${shellClass(themeMode, colorScheme)} ${platform}`;

  return (
    <ElementCatalogContext.Provider value={elements}>
    <section className={rootClass}>
      <header className="elements-hero ux-elements-hero">
        <div>
          <small>{concept.eyebrow} · {elements.release}</small>
          <h1>{concept.name} Component Catalog</h1>
          <p>React Native product specifications, separated from the web-only tools used to review them.</p>
        </div>
        <div className="elements-hero-actions">
          <button type="button" aria-label="Search">
            <Search size={18} />
          </button>
          <button type="button" aria-label="Export">
            <Download size={18} />
          </button>
        </div>
      </header>

      <CatalogSummary groups={elements.groups} />
      <CatalogGroup groupId="product-ui">
      <TokenSection />
      <TypographySection roster={roster} />
      <ElementSection title="Phone Status Bar">
        <div className={`ux-phone-status-preview theme-${themeMode} ux-scheme-${colorScheme} status-bar-design`}>
          <PhoneStatusBar />
        </div>
      </ElementSection>
      </CatalogGroup>
      <WorkbenchElements roster={roster} selectedSection={selectedSection} selectedUnit={selectedUnit} selectedSectionId={selectedSectionId} onSelectSection={onSelectSection} onSelectUnit={onSelectUnit} onToggleOption={onToggleOption} />
    </section>
    </ElementCatalogContext.Provider>
  );
}

function TokenSection() {
  const tokens = [
    ["Accent", "var(--ux-accent)", "var(--ux-accent-ink)"],
    ["Accent 2", "var(--ux-accent-2)", "var(--ux-accent-ink)"],
    ["Accent · Secondary text", "var(--ux-accent)", "var(--ux-accent-ink-secondary)"],
    ["Accent · Tertiary text", "var(--ux-accent)", "var(--ux-accent-ink-tertiary)"],
    ["Surface", "var(--ux-surface)", "var(--ux-ink-primary)"],
    ["Surface · Secondary text", "var(--ux-surface)", "var(--ux-ink-secondary)"],
    ["Surface · Tertiary text", "var(--ux-surface)", "var(--ux-ink-tertiary)"],
    ["Surface 2", "var(--ux-surface-2)", "var(--ux-ink)"],
    ["Surface 3", "var(--ux-surface-3)", "var(--ux-ink)"],
    ["Cool", "var(--ux-cool)", "var(--ux-cool-ink)"],
    ["Warning", "var(--ux-warn)", "var(--ux-warn-ink)"],
    ["Error", "var(--ux-err)", "var(--ux-err-ink)"],
  ];

  return (
    <ElementSection title="Color Tokens">
      <div className="token-grid ux-token-grid">
        {tokens.map(([label, bg, fg]) => (
          <div className="token-swatch ux-token-swatch" key={label} style={{ background: bg, color: fg }}>
            <strong>{label}</strong>
            <small>{bg}</small>
          </div>
        ))}
      </div>
    </ElementSection>
  );
}

function TypographySection({ roster }: { roster: Roster }) {
  return (
    <ElementSection title="Typography">
      <div className="type-stack ux-type-stack">
        <span className="type-display">{roster.pointsUsed} pts</span>
        <h2>{roster.name}</h2>
        <h3>{roster.faction}</h3>
        <p>Compact hierarchy tuned for fast roster edits, point checks, and table-side scanning.</p>
        <small>Metadata · status · helper text</small>
      </div>
    </ElementSection>
  );
}


function WorkbenchElements({
  roster,
  selectedSection,
  selectedUnit,
  selectedSectionId,
  onSelectSection,
  onSelectUnit,
  onToggleOption,
}: {
  roster: Roster;
  selectedSection: RosterSection;
  selectedUnit: RosterUnit;
  selectedSectionId: string;
  onSelectSection: (id: string) => void;
  onSelectUnit: (id: string) => void;
  onToggleOption: (id: string) => void;
}) {
  const checks = rosterChecks(roster);
  const profileUnit = flattenUnits(roster).find((unit) => unit.detail) ?? selectedUnit;

  return (
    <>
      <CatalogGroup groupId="product-ui" continuation>
      <ElementSection title="Workbench Chrome">
        <header className="ux-wb-top ux-elements-static ux-elements-roster-bar">
          <button type="button" className="ux-icon-btn" aria-label="Back">
            <ArrowLeft size={18} />
          </button>
          <div className="ux-wb-title">
            <strong>{roster.name}</strong>
          </div>
          <RosterShareButton />
          <RosterMoreMenu open={false} onOpenChange={() => undefined} />
        </header>
        <small className="ux-phone-overview-identity">{roster.faction} · {roster.system}</small>
        <header className="ux-wb-top ux-elements-static ux-elements-roster-bar">
          <button type="button" className="ux-icon-btn" aria-label="Back">
            <ArrowLeft size={18} />
          </button>
          <div className="ux-wb-title">
            <strong>{roster.name}</strong>
          </div>
          <RosterShareButton />
        </header>
        <small className="ux-hint">Read-only roster: Share only, no More button.</small>
        <header className="ux-wb-top unit-detail ux-elements-static">
          <button type="button" className="ux-icon-btn" aria-label="Back">
            <ArrowLeft size={18} />
          </button>
          <div className="ux-wb-title">
            <strong>{selectedUnit.name}</strong>
            <small>{selectedSection.name} · {Math.max(0, roster.pointsLimit - roster.pointsUsed)} pts left</small>
          </div>
          <span className="ux-wb-header-points" aria-label={`${selectedUnit.points} points`}>
            <b>{selectedUnit.points}</b>
            <small>pts</small>
          </span>
          <span className="ux-detail-progress" role="progressbar" aria-label="Roster points used" aria-valuemin={0} aria-valuemax={roster.pointsLimit} aria-valuenow={roster.pointsUsed}>
            <i style={{ width: `${Math.min(100, (roster.pointsUsed / roster.pointsLimit) * 100)}%` }} />
          </span>
        </header>
        <BudgetMeter roster={roster} />
        <ExpandableBudget roster={roster} />
      </ElementSection>

      <ElementSection title="Roster More Menu">
        <small className="ux-hint">UX-020: the roster bar has a visible Share button (Export or share) next to More. The More menu, anchored to its button, holds Undo and Redo only: before an edit (both disabled), after an edit (Undo enabled) and after an Undo (Redo enabled). A read-only roster has Share only and no More button.</small>
        <div className="ux-elements-more-menus">
          <RosterMoreMenu open inline onOpenChange={() => undefined} />
          <RosterMoreMenu open inline canUndo onOpenChange={() => undefined} />
          <RosterMoreMenu open inline canUndo canRedo onOpenChange={() => undefined} />
        </div>
      </ElementSection>

      <ElementSection title="Subscription Gate">
        <div className="ux-elements-subscription-preview">
          <SubscriptionGate />
        </div>
      </ElementSection>

      <TabletWorkspaceElement roster={roster} />

      <ElementSection title="Roster Creation">
        <button type="button" className="ux-start-row on">
          <span>
            <strong>Example System</strong>
            <small>Modes with guided configuration</small>
          </span>
          <Check size={18} />
        </button>
        <button type="button" className="ux-select-field">
          <span><strong>Faction A</strong><small>Example System</small></span><ChevronDown size={16} />
        </button>
        <button type="button" className="ux-select-field">
          <span><strong>Mode A</strong><small>Faction A</small></span><ChevronDown size={16} />
        </button>
        <div className="ux-start-group ux-guided-step" role="radiogroup" aria-label="Size">
          <h4>Size</h4>
          <small className="ux-guided-note">Sets the Credits limit</small>
          {[["Option A", "Limit 1000 Credits", false], ["Option B", "Limit 2000 Credits", true]].map(([name, limit, on]) => (
            <button key={String(name)} type="button" role="radio" aria-checked={Boolean(on)} className={`ux-guided-option ${on ? "on" : ""}`}>
              {on ? <CircleDot size={20} /> : <Circle size={20} />}<span><strong>{String(name)}</strong><em className="ux-guided-cost">{String(limit)}</em></span>
            </button>
          ))}
        </div>
        <div className="ux-start-group ux-guided-step" role="group" aria-label="Extras">
          <h4>Extras · optional</h4>
          <small className="ux-guided-budget">1 / 2 selections</small>
          <button type="button" role="checkbox" aria-checked className="ux-guided-option on"><SquareCheck size={20} /><span><strong>Option A</strong><em className="ux-guided-cost">+1 Resource A</em></span></button>
          <div className="ux-guided-option"><span><strong>Option B</strong><em className="ux-guided-cost">+2 Resource B</em><small>Up to 2</small></span><span className="ux-stepper"><button type="button" aria-label="Fewer Option B"><Minus size={14} /></button><b>0</b><button type="button" aria-label="More Option B"><Plus size={14} /></button></span></div>
        </div>
        <div className="ux-start-group">
          <h4>Credits limit</h4>
          <div className="ux-filter-row">
            {["1000 Credits", "2000 Credits", "Custom", "Unlimited"].map((label) => (
              <button key={label} type="button" className={`ux-filter-pill ${label === "Custom" ? "on" : ""}`}>{label}</button>
            ))}
          </div>
          <label className="ux-custom-points">
            <input value="999" aria-label="Custom Credits limit" readOnly />
            <span>Credits</span>
          </label>
          <small className="ux-guided-note">At most 999 Credits · shown only when no choice sets the limit</small>
        </div>
        <label className="ux-start-group ux-roster-name">
          <h4>Roster name</h4><input value="New roster" aria-label="Roster name" readOnly />
        </label>
        <button type="button" className="ux-ghost-btn ux-guided-skip">Skip guided setup</button>
        <div className="ux-loadout-selector-layer ux-elements-static">
          <section className="ux-loadout-selector" role="dialog" aria-label="Choose faction">
            <header><span><strong>Choose faction</strong><small>Example System</small></span><button type="button" aria-label="Close picker"><X size={18} /></button></header>
            <label className="ux-loadout-selector-search"><Search size={15} /><input placeholder="Search factions" readOnly /></label>
            <div className="ux-loadout-choice-list">
              {[['Faction A', 'Group A'], ['Faction B', 'Group B'], ['Faction C', 'Group C']].map(([name, group], index) => (
                <button type="button" className={`ux-loadout-choice ${index === 0 ? "selected" : ""}`} key={name}><span><strong>{name}</strong><small>{group}</small></span><span className="ux-loadout-choice-check" aria-hidden>{index === 0 ? <Check size={15} /> : null}</span></button>
              ))}
            </div>
          </section>
        </div>
      </ElementSection>

      <ElementSection title="Roster Tree">
        <div className="ux-wb-search">
          <Search size={15} />
          <input placeholder="Filter units" readOnly />
        </div>
        {roster.forces[0].sections.slice(0, 3).map((section) => (
          <div className={`ux-tree-branch ${section.id === selectedSectionId ? "open" : ""}`} key={section.id}>
            <button type="button" className="ux-tree-section" onClick={() => onSelectSection(section.id)}>
              <PanelsTopLeft size={14} />
              <strong>{section.name}</strong>
              <small>{section.required ?? section.units.length}</small>
            </button>
            {section.id === selectedSectionId ? (
              <div className="ux-tree-units">
                {section.units.map((unit) => (
                  <button key={unit.id} type="button" className={`ux-tree-unit ${unit.status ?? "valid"} ${selectedUnit.id === unit.id ? "active" : ""}`} onClick={() => onSelectUnit(unit.id)}>
                    <span className="ux-tree-rail" aria-hidden />
                    <TreeUnitMain unit={unit} name={unit.name} />
                    {unit.status && unit.status !== "valid" ? <StatusGlyph status={unit.status} size={13} /> : unit.points ? <b>{unit.points}</b> : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </ElementSection>

      <ElementSection title="Slot Visibility">
        <ManySlotsElement />
      </ElementSection>

      <ForceEntriesElement roster={roster} />

      <ElementSection title="Detail Pane">
        <div className="ux-keywords">
          {selectedUnit.keywords.map((keyword) => (
            <Chip key={keyword} tone="cool">
              {keyword}
            </Chip>
          ))}
        </div>
        {selectedUnit.note ? <p className="ux-config-note">{selectedUnit.note}</p> : null}
      </ElementSection>

      <ElementSection title="Unit Options · Mobile 5A">
        <small className="ux-elements-note">UX-015/017/019/021: categories follow the content; Profile needs profiles or rules. Open Other options → Configure Drills: Back returns to Lancers. Training shares one radio choice across its folded child groups with a single outer None; quantities and independent checkboxes remain.</small>
        <div className="ux-elements-stack"><MobileUnitOptions compact /><MobileUnitOptions state="loading" compact /><MobileUnitOptions state="error" compact /><MobileUnitOptions state="gone" compact /></div>
      </ElementSection>

      <ElementSection title="Nested Detail Back">
        <small className="ux-elements-note">Built (2026-10-21, user feedback): a nested detail names the parent Back returns to. iOS: the native Back button reads "‹ Parent" (UIKit shortens it to "Back", then the arrow, when tight). Android (no back titles): "in Parent" under the title, next to the Up arrow; title 20 bold, both lines one line each. Top-level details keep the arrow only. Breadcrumbs unchanged. Names come from worker breadcrumbs.</small>
        <div className="ux-elements-stack"><MobileUnitOptions compact initialDrilled backStyle="ios" /><MobileUnitOptions compact initialDrilled backStyle="android" /></div>
      </ElementSection>

      <ElementSection title="Foldable Option Sections">
        <div style={{ display: "grid", gap: 10, maxWidth: 360 }}>
          <small className="ux-elements-note">Built (UX-005): every option section is a header button (44 pt, expanded state) that folds its own body, at every nesting level and in model loadouts. Sections start folded at every level; opening a parent leaves its nested sections folded and never closes another section. The header keeps the name, "x/y selections", limits and errors; a folded header with an error beneath it adds "Issues inside". Open sections are kept per roster (Profile tab, collapsed model card, refreshes, drill-down, later visits, restart) and are never shared between selections; Settings → Rosters → Remember option sections turns that off (new visits then start folded). Model cards are separate and start expanded. A folded header shows a muted summary of what is selected inside (nested sections included, "2× Name" when more than one, two lines at most with an ellipsis, full list in the spoken label); nothing selected shows no summary line. Samples below: folded with a summary, folded with nothing selected, a long summary cut at two lines, and open.</small>
          <OptionFoldSamples />
          <div className="ux-elements-stack"><MobileUnitOptions compact /></div>
        </div>
      </ElementSection>

      <ElementSection title="Model Stack Split and Selection Controls">
        <small>Radio: one of several; max-one ancestors share that choice across nested alternatives, with None only on the outer group. Checkbox: independent optional picks, including a single option or nothing. Switch: immediate Settings only. Stepper: counts. Visible glyphs 21–22 px; target 48 px (≥44 pt / 48 dp). Restart restores selection, tab, hidden entries and folds; pending edits and split drafts reset. Controls reload from the worker.</small>
        <div className="ux-mobile-unit-options"><ModelStackSamples /></div>
      </ElementSection>

      <ElementSection title="Unit Profile Tab · Mobile 5B">
        <div style={{ display: "grid", gap: 10 }}>
          <small className="ux-elements-note">Built (UX-015/017): Options | Profile tabs below type/cost and budget, only when displayable profiles or rules exist. Profiles-only and rules-only both retain Profile; Drills has neither and omits it. Profile: one card per profile type, horizontal scroll when wide, columns sized to their text; text columns (descriptions) are left-aligned and take the room left. Rules open on tap when they have a description. Plain category labels close either tab and wrap across lines. A nested header Back returns to the mounted parent, keeping its scroll and edits (UX-019).</small>
          <div className="ux-elements-stack"><MobileUnitOptions compact initialTab="profile" /><MobileUnitOptions compact initialTab="profile" profileContent="profiles" /><MobileUnitOptions compact initialTab="profile" profileContent="rules" /><MobileUnitOptions compact initialDrilled initialTab="profile" /></div>
        </div>
      </ElementSection>

      <ElementSection title="Unit Links (associations)">
        <div style={{ display: "grid", gap: 10, maxWidth: 360 }}>
          <small className="ux-elements-note">Built: below the options, one section per association of the shown unit, named after it, with "linked/max linked" and "Needs n more link(s)" when a minimum is unmet. Max 1: radio rows, tapping another unit moves the link in one step, tapping the linked one unlinks it. Several: check rows, still editable at the maximum ("Limit reached · can exceed"). Ineligible units are not listed; a linked unit that is no longer eligible stays, marked, so it can be unlinked. Roster rows show the first link as a one-line caption ("Linked to Squad A (Escorting)", "+N" for more).</small>
          <button type="button" className="ux-tree-unit"><span className="ux-tree-rail" /><span className="ux-tree-unit-main"><span>Escort leader</span><span className="ux-tree-link-caption">Linked to Squad A (Escorting)</span></span><b>60</b></button>
          <button type="button" className="ux-tree-unit"><span className="ux-tree-rail" /><span className="ux-tree-unit-main"><span>Squad A <small>×5</small></span><span className="ux-tree-link-caption">Linked from Escort leader (Escorting) +1</span></span><b>90</b></button>
        </div>
      </ElementSection>

      <ElementSection title="Grouped Units · Nested Rows">
        <div style={{ display: "grid", gap: 10, maxWidth: 360 }}>
          <small className="ux-elements-note">Built: a unit whose own link has the data's "group" action is drawn under the unit it links to, inside that unit's slot card, indented with a corner connector, right after it (several in roster order). Its points and limits still count in its own slot; that slot keeps its header with a muted line "N shown under linked units". The nesting link is left out of both captions; other links still show. Same tap, swipe and accessibility actions; the label adds "Attached to {"{unit}"} ({"{association}"})". Falls back to its own slot when the target is missing, hidden, in another force or itself nested.</small>
          <div className="ux-tree-slot-head"><strong>Core</strong><span>1/3 · 150</span></div>
          <button type="button" className="ux-tree-unit"><span className="ux-tree-rail" /><span className="ux-tree-unit-main"><span>Squad A <small>×5</small></span></span><b>90</b></button>
          <button type="button" className="ux-tree-unit ux-tree-nested"><span className="ux-tree-connector" aria-hidden /><span className="ux-tree-rail" /><span className="ux-tree-unit-main"><span>Escort leader</span></span><b>60</b></button>
          <div className="ux-tree-slot-head"><strong>Command</strong><span>1/2 · 60<small className="ux-tree-elsewhere">1 shown under linked units</small></span></div>
        </div>
      </ElementSection>

      <ElementSection title="Formatted Data Text">
        <div style={{ display: "grid", gap: 10, maxWidth: 360 }}>
          <small className="ux-elements-note">Built: rule descriptions and profile table cells render the data's formatting codes: **bold**, *italic*, ^^keyword^^ (accent tone, semibold), line breaks and paragraph gaps, and "- " / "■ " lines as bullets with a hanging indent. Unmatched markers stay as written. Screen readers hear the text without markers; column widths use the plain text. Exports keep the codes as written.</small>
          <div className="ux-rich-text">
            <p><b><span className="kw">Alpha</span></b> units in range gain <i>Steady</i>.</p>
            <p className="bullet">Re-roll one test each turn.</p>
            <p className="bullet">Add 1 to the next roll for <span className="kw">Beta</span> units.</p>
          </div>
        </div>
      </ElementSection>
      <OptionsSection selectedUnit={selectedUnit} onToggleOption={onToggleOption} />

      <LoadoutEditorElement unit={profileUnit} />

      <UnitProfilesElement unit={profileUnit} />

      <ReferenceGlancesElement unit={profileUnit} />

      <ElementSection title="Unit Detail Toggle">
        <div className="ux-detail-mode-layer ux-elements-static">
          <div className="ux-detail-action-menu ux-elements-static" role="menu" aria-label="Unit actions">
            <button type="button" role="menuitem"><Pencil size={15} />Rename & favorite</button>
            <button type="button" role="menuitem"><Copy size={15} />Duplicate</button>
            <button type="button" role="menuitem"><MoveRight size={15} />Move</button>
          </div>
          <nav className="ux-detail-mode-bar ux-elements-static" aria-label="Unit detail view">
            <button type="button" className="ux-detail-mode-tab"><Cog size={18} /><span>Options</span></button>
            <button type="button" className="ux-detail-menu-fab" aria-label="More unit actions"><Ellipsis size={22} /></button>
            <button type="button" className="ux-detail-mode-tab active"><BookOpen size={18} /><span>Profile</span></button>
          </nav>
        </div>
      </ElementSection>

      <ElementSection title="Entry Action Menus">
        <div className="ux-force-action-menu" style={{ position: "static" }} role="menu"><button type="button"><Pencil size={14} />Rename & favorite</button></div>
      </ElementSection>

      <ElementSection title="Swipe Unit Actions">
        <div style={{ display: "grid", gap: 10, maxWidth: 360 }}>
          <small className="ux-elements-note">Built (plan 4A): swipe right reveals Duplicate, swipe left reveals Delete (as New Recruit). A full swipe or a tap on the revealed action runs it; one row open at a time; scrolling closes it. No confirmation: the Undo toast brings a deleted unit back.</small>
          <div className="ux-swipe-unit open">
            <div className="ux-swipe-actions leading"><button type="button" className="duplicate"><Copy size={14} /><span>Duplicate</span></button></div>
            <button type="button" className="ux-tree-unit ux-swipe-unit-content active" style={{ transform: "translateX(88px)" }}><span className="ux-tree-rail" /><span className="ux-tree-unit-main"><span>{selectedUnit.customName ?? selectedUnit.name}</span><small>×{selectedUnit.count}</small></span><b>{selectedUnit.points}</b></button>
          </div>
          <div className="ux-swipe-unit open">
            <div className="ux-swipe-actions trailing"><button type="button" className="delete"><Trash2 size={14} /><span>Delete</span></button></div>
            <button type="button" className="ux-tree-unit ux-swipe-unit-content active" style={{ transform: "translateX(-88px)" }}><span className="ux-tree-rail" /><span className="ux-tree-unit-main"><span>{selectedUnit.customName ?? selectedUnit.name}</span><small>×{selectedUnit.count}</small></span><b>{selectedUnit.points}</b></button>
          </div>
          <div className="ux-undo-toast" role="status"><span>Deleted {selectedUnit.customName ?? selectedUnit.name}</span><button type="button">Undo</button></div>
        </div>
      </ElementSection>

      <ElementSection title="Roster Undo / Redo · Saved">
        <div className="ux-history-header" style={{ maxWidth: 360 }}>
          <span className="ux-history-title"><strong>Roster name</strong><small>Faction · Game system</small></span>
          <span className="ux-history-buttons"><button type="button" aria-label="Undo"><RotateCcw size={16} /></button><button type="button" aria-label="Redo" disabled><RotateCcw size={16} style={{ transform: "scaleX(-1)" }} /></button><button type="button" aria-label="Search"><Search size={16} /></button><button type="button" aria-label="Export"><Upload size={16} /></button></span>
          <span className="ux-history-status"><small>885 / 1000 · 115 open</small><small className="saved">Saved</small></span>
          <span className="ux-history-status"><small>885 / 1000 · 115 open</small><small className="failed">Not saved</small></span>
        </div>
      </ElementSection>

      <ElementSection title="Rename Dialog">
        <section className="ux-entry-dialog" style={{ borderRadius: 12 }}><header><span><strong>Rename unit</strong><small>A reusable snapshot will be saved to your Library.</small></span><button type="button"><X size={17} /></button></header><label><span>Custom name</span><input value="Veteran Spearhead" readOnly /></label><footer><button type="button">Cancel</button><button type="button" className="primary">Save favorite</button></footer></section>
      </ElementSection>

      <ElementSection title="Move Unit Dialog">
        <section className="ux-entry-dialog" style={{ borderRadius: 12 }}><header><span><strong>Move unit</strong><small>Compatible Core sections</small></span></header><div className="ux-destination-list"><button type="button"><span><strong>Free Cities Auxiliary</strong><small>Unrestricted Collection · Core</small></span><MoveRight size={16} /></button></div></section>
      </ElementSection>

      <ElementSection title="Validation Rail">
        <div className="ux-wb-rail-head">
          <AlertTriangle size={15} />
          <strong>Validation</strong>
          <span className="ux-wb-rail-count">{checks.length}</span>
        </div>
        {checks.map((unit) => (
          <button key={unit.id} type="button" className={`ux-rail-item ${unit.status}`} onClick={() => onSelectUnit(unit.id)}>
            <StatusGlyph status={unit.status} size={15} />
            <span>
              <strong>{unit.name}</strong>
              <small>{unit.note ?? unit.slotImpact}</small>
            </span>
          </button>
        ))}
        <div className="ux-wb-rail-foot">
          <span>{flattenUnits(roster).length} units</span>
          <span>{countSections(roster)} slots</span>
        </div>
      </ElementSection>

      <ElementSection title="Issues List · Jump to Entry">
        <div style={{ display: "grid", gap: 10, maxWidth: 360 }}>
          <small className="ux-elements-note">Built (plan 6A): the roster header's check line opens the list (chevron). Severity is an icon shape plus its word, never colour alone. A tap goes to the entry: a unit opens its options at the issue's path (the issues outlined); a slot, force or the roster is opened, scrolled to and highlighted for 3 seconds. Rules the app does not evaluate yet are one separate section at the end. While rules are being checked the list says so instead of showing "Roster is legal".</small>
          <button type="button" className="ux-issue-status"><AlertTriangle size={13} /><span>1 error, 2 warnings</span><ChevronRight size={13} /></button>
          <div className="ux-issue-group"><span className="error"><CircleDot size={13} />2 errors</span><small>Force name</small></div>
          <button type="button" className="ux-rail-item error"><StatusGlyph status="error" size={15} /><span><strong>Error · Slot name</strong><small>Roster exceeds the slot maximum</small></span><ChevronRight size={14} /></button>
          <div className="ux-issue-group"><span className="warning"><AlertTriangle size={13} />1 warning</span><small>Force name</small></div>
          <button type="button" className="ux-rail-item warning"><StatusGlyph status="warning" size={15} /><span><strong>Warning · Unit name</strong><small>Missing attached bodyguard</small></span><ChevronRight size={14} /></button>
          <div className="ux-issue-incomplete"><AlertTriangle size={14} /><span><strong>Rules not evaluated yet</strong><small>Battle Augur does not evaluate these rules yet, so the result may differ from New Recruit. They are not problems with the roster.</small></span></div>
          <div className="ux-issue-target"><strong>Slot name</strong><small>1 / 1 · highlighted after a jump</small></div>
          <div className="ux-issue-empty"><Check size={18} /><strong>Roster is legal</strong><small>No errors or warnings.</small></div>
        </div>
      </ElementSection>

      <ElementSection title="Add Pool Rows">
        <div className="ux-wb-search">
          <Search size={15} />
          <input placeholder={`Search ${selectedSection.name}`} readOnly />
        </div>
        {flattenUnits(roster).slice(0, 3).map((unit) => (
          <button key={unit.id} type="button" className="ux-pool-row" onClick={() => onSelectUnit(unit.id)}>
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
        {/* Plan 4B: multi-add feedback, an added count, a refused row and the hidden toggle. */}
        <div className="ux-pool-added" role="status"><Check size={14} />Added {flattenUnits(roster)[0]?.name}</div>
        <button type="button" className="ux-pool-row"><span><strong>{flattenUnits(roster)[0]?.name}<em className="ux-pool-count"> (1/3)</em></strong><small>{flattenUnits(roster)[0]?.role}</small></span><span className="ux-pool-meta"><b>{flattenUnits(roster)[0]?.points} pts</b><Chip tone="valid">available</Chip></span><Plus size={16} /></button>
        <button type="button" className="ux-pool-row locked" disabled><span><strong>{flattenUnits(roster)[1]?.name}</strong><small>Maximum reached</small></span><span className="ux-pool-meta"><b>{flattenUnits(roster)[1]?.points} pts</b><Chip tone="error">locked</Chip></span><Plus size={16} /></button>
        <button type="button" className="ux-pool-hidden">Show hidden (2)</button>
      </ElementSection>

      <ElementSection title="Favorite Creation Sections">
        <section className="ux-favorite-creation"><div className="ux-result-label"><Heart size={13} />Favorite units</div><div><button type="button"><Heart size={14} /><span><strong>Veteran Spearhead</strong><small>{selectedUnit.points} pts · configured</small></span><Plus size={14} /></button></div></section>
      </ElementSection>

      <ElementSection title="Smart Search (Settings)">
        <div className="ux-wb-search smart">
          <Command size={15} />
          <input placeholder={`Add a legal ${selectedSection.name} unit or ask…`} readOnly />
        </div>
        <div className="ux-suggest">
          <Sparkles size={14} />
          <div className="ux-suggest-chips">
            {["legal & affordable", "fills this slot", "best value pick"].map((label) => (
              <button key={label} type="button" className="ux-suggest-chip">
                {label}
              </button>
            ))}
          </div>
        </div>
      </ElementSection>

      <ElementSection title="Preference Selectors">
        <AppearancePreferences />
      </ElementSection>
      <ElementSection title="Appearance Import Feedback">
        <AppearancePreferences states />
      </ElementSection>

      <ElementSection title="Smart Search">
        <div className="ux-navbar-search ux-smart-search-input">
          <Wand2 size={15} />
          <input placeholder="Search units, upgrades, or ask…" readOnly />
        </div>
        <div className="ux-smart-segment">
          <button type="button" className="on"><Search size={14} />Find units</button>
          <button type="button"><Coins size={14} />Fill points</button>
        </div>
        <div className="ux-smart-scope">
          <button type="button" className="ux-smart-scope-pill on"><Layers size={14} />Roster</button>
          <button type="button" className="ux-smart-scope-pill"><LibraryBig size={14} />Library</button>
          <button type="button" className="ux-smart-scope-pill on"><Heart size={14} />Favorites</button>
        </div>
        <div className="ux-smart-cost-filter">
          <span className="ux-smart-cost-label">Cost</span>
          <div className="ux-smart-cost-pills">
            {["Any cost", "≤ 25", "≤ 50", "≤ 100"].map((label, index) => (
              <button key={label} type="button" className={`ux-filter-pill ${index === 0 ? "on" : ""}`}>{label}</button>
            ))}
          </div>
        </div>
        <button type="button" className="ux-smart-autoadd on">
          <span className="ux-smart-autoadd-dot" aria-hidden><Check size={11} /></span>
          Auto-add to roster
        </button>
        <div className="ux-pool ux-smart-results">
          <div className="ux-pool-row ux-smart-result">
            <span><strong>{selectedUnit.name}</strong><small>{selectedUnit.role} · {selectedSection.name}</small></span>
            <span className="ux-pool-meta"><b>{selectedUnit.points} pts</b></span>
            <button type="button" className="ux-smart-add" aria-label="Add"><Plus size={16} /></button>
          </div>
          <button type="button" className="ux-pool-row ux-smart-fill-row">
            <span><strong>Ward Shield</strong><small>{selectedUnit.name} · {selectedSection.name}</small></span>
            <span className="ux-pool-meta"><b>+15 pts</b></span>
            <ChevronRight size={16} />
          </button>
        </div>
      </ElementSection>

      <ElementSection title="Lookup & Sources">
        <div className="ux-source-filters">
          {["All sources", roster.system, roster.faction].map((label, index) => (
            <button key={label} type="button" className={`ux-filter-pill ${index === 0 ? "on" : ""}`}>
              {label}
            </button>
          ))}
        </div>
        <section className="ux-lookup-group">
          <div className="ux-lookup-title">
            <Search size={15} />
            <strong>Units</strong>
          </div>
          {flattenUnits(roster).slice(0, 2).map((unit) => (
            <button key={unit.id} type="button" className="ux-lookup-row">
              <span>
                <strong>{unit.name}</strong>
                <small>{unit.role}</small>
              </span>
              <b>{unit.points} pts</b>
            </button>
          ))}
        </section>
        <details className="ux-source-section" open>
          <summary>
            <span>
              <Database size={16} />
              <strong>Sources</strong>
            </span>
          </summary>
          <button type="button" className="ux-import-source">
            <FileInput size={18} />
            <span>
              <strong>Import source</strong>
              <small>Add catalogue files or rules packs</small>
            </span>
          </button>
          <div className="ux-source-list">
            <button type="button" className="ux-source-row on">
              <span>
                <strong>{roster.faction}</strong>
                <small>{roster.system} · Imported today</small>
              </span>
              <Chip tone="valid">v42</Chip>
            </button>
          </div>
        </details>
      </ElementSection>

      <ElementSection title="Sources Management">
        <UpdatesNotice />
        <div className="ux-src-section-head"><span className="ux-result-label">Installed</span><button type="button" className="ux-job-link">Select</button></div>
        <div className="ux-source-list ux-managed-source-list ux-src-list">
          <SourceRow source={EXAMPLE_SOURCES[0]} />
          <SourceRow source={{ ...EXAMPLE_SOURCES[1], status: "updating" }} />
          <SourceRow source={EXAMPLE_SOURCES[3]} />
          <SourceRow source={EXAMPLE_SOURCES[0]} selecting selected />
          <SourceRow source={EXAMPLE_SOURCES[2]} selecting />
        </div>
        <div className="ux-src-chips"><SourceStatusChip status="ready" /><SourceStatusChip status="update" /><SourceStatusChip status="updating" /><SourceStatusChip status="review" /><SourceStatusChip status="broken" /></div>
        <section className="ux-sources-empty"><span><Database size={25} /></span><strong>No game data yet</strong><small>Add game data from a collection, a repository link or GitHub search.</small><button type="button"><Plus size={16} />Add game data</button></section>
      </ElementSection>

      <ElementSection title="Source Update Card">
        <SourceUpdateCard />
        <LastUpdateCard checked={false} />
        <LastUpdateCard />
      </ElementSection>

      <ElementSection title="Source Versions">
        <SourceVersions />
        <OlderVersionRow />
        <SourceVersions older />
        <DeleteVersionAlert inline />
        <JobToast tone="neutral" message="Switched to version 1a2b3c4" />
        <RemoveSourceAlert inline />
      </ElementSection>

      <ElementSection title="App Dialog · Menu">
        <RemoveSourceAlert inline />
        <DeleteVersionAlert inline />
        <AppDialog inline title="Remove Example System One?" message="3 rosters will open read-only until this data is added again. Frees 41 MB. A long message wraps and the dialog scrolls instead of growing past the screen when the text size is large." actions={[{ label: "Cancel" }, { label: "Remove", tone: "destructive" }]} />
        <ActionMenuDialog inline />
        <small className="ux-elements-note">Built from UX-013 (DEC-027): replaces every system alert and action sheet. Centred on a dimmed backdrop in the theme (light, dark, imported schemes); Cancel (secondary) is first, the destructive action is filled in the error colour, other actions are primary or secondary. Menus stack the actions with Cancel last. Backdrop tap and Android back cancel, except a dialog that must be answered.</small>
      </ElementSection>

      <ElementSection title="Import Report Groups">
        <ImportReportGroups />
        <ImportReportGroups expanded />
        <small className="ux-elements-note">UX-014 (DEC-027): on the source detail the severity counts stay visible and the groups of messages start folded behind Show; Hide folds them again.</small>
      </ElementSection>

      <ElementSection title="Migration Report">
        <MigrationReportBody checked={false} />
        <MigrationReportBody />
      </ElementSection>

      <ElementSection title="Source Addition">
        <div className="ux-result-label">Collections</div>
        <DefaultCollectionCard />
        <DefaultListingRows />
        <UserCollectionRows />
        <small className="ux-elements-note">Default collection hidden (DEC-028): no card or default listings; this row in the user's group shows it again.</small>
        <UserCollectionRows defaultHidden />
        <section className="ux-source-method">
          <div className="ux-source-method-heading"><span className="ux-setting-icon"><FileInput size={18} /></span><span><strong>Have a link?</strong><small>Any GitHub repository with roster data files.</small></span></div>
          <div className="ux-source-url"><input aria-label="Repository example" placeholder="owner/name or a GitHub link" /><button type="button">Continue</button></div>
        </section>
      </ElementSection>

      <ElementSection title="Collection Page">
        <div className="ux-source-list ux-managed-source-list ux-src-list">
          {DEFAULT_COLLECTION.map((entry) => <CollectionSourceRow key={entry.repo} entry={entry} />)}
          <CollectionSourceRow entry={{ name: "example-system-seven", description: "Older edition, no longer maintained", repo: "community-data/example-system-seven", archived: true, action: "install" }} />
        </div>
        <CollectionMenuDialog inline kind="default" />
        <CollectionMenuDialog inline kind="user" />
        <small className="ux-elements-note">The ⋯ menu: Hide collection only on the default collection (DEC-028, undone from Add game data); Remove collection only on the user's own entries, confirmed ("Installed game data stays"). Listings of the default collection and entries opened from another collection offer neither.</small>
      </ElementSection>

      <ElementSection title="Search GitHub">
        <div className="ux-search-field ux-col-search"><Search size={15} /><input aria-label="Repository name or topic" placeholder="Repository name or topic" defaultValue="example system" /></div>
        <div className="ux-source-list ux-managed-source-list ux-src-list">
          <CollectionSourceRow entry={{ name: "example-system-eight", description: "Fan-made data for a skirmish game", repo: "someone/example-system-eight", action: "install" }} />
        </div>
        <small className="ux-elements-note">Plan 2C: GitHub-wide search on its own screen, run on submit; the same rows and actions as a collection page.</small>
      </ElementSection>

      <ElementSection title="Add Collection Sheet">
        <AddCollectionSheet inline state="found" />
        <AddCollectionSheet inline state="library" />
        <AddCollectionSheet inline state="duplicate" />
        <AddCollectionSheet inline state="repository" />
      </ElementSection>

      <ElementSection title="Install From A File">
        <LocalImportRow />
        <LocalImportChoiceDialog inline />
        <JobModal inline title={`Installing ${LOCAL_FILE.label}`} subtitle={`From a file · ${LOCAL_FILE.files} files · ${LOCAL_FILE.size}`} percent={8} stepLabel="Step 1 of 4" steps={localSteps("files")} />
        <LocalRefusedNotice />
        {LOCAL_ERRORS.map(([id]) => <LocalImportError key={id} kind={id} />)}
        <div className="ux-source-list ux-managed-source-list ux-src-list"><SourceRow source={LOCAL_SOURCE} /></div>
        <LocalInterruptedNotice />
        <LocalSourceNote />
        <LocalSourceRows />
        <small className="ux-elements-note">DS-3 (DEC-035): archives (.zip, .bsr), .gst/.cat (also .gstz/.catz), data .json or a folder. Files and folder are two actions of the app's own menu dialog. The job has Copying files in place of Download and no Try again; after a restart the interrupted notice offers Dismiss only. A local source shows "From a file · " and the picked name, and its import date, and has no update check, GitHub link or Install more factions.</small>
      </ElementSection>

      <ElementSection title="Advanced Installation Setting">
        <div className="ux-result-label">Game data</div>
        <AdvancedInstallSetting on={false} />
        <AdvancedInstallSetting on />
      </ElementSection>

      <ElementSection title="Game Data Settings">
        <div className="ux-result-label">Game data</div>
        <WifiOnlySetting on={false} />
        <WifiOnlySetting on />
        <NotificationsSetting />
        <NotificationsSetting on />
      </ElementSection>

      <ElementSection title="Automatic Update Checks Setting">
        <div className="ux-result-label">Game data</div>
        <AutoUpdateChecksSetting on />
        <AutoUpdateChecksSetting on={false} />
        <small className="ux-elements-note">UX-008 (DEC-027): on by default, shown while the update flag is on. Off stops the checks at start, on return to the app and hourly, and the check on opening Sources; pull to refresh and Check now still work.</small>
      </ElementSection>

      <ElementSection title="Remember Option Sections Setting">
        <div className="ux-result-label">Rosters</div>
        <RememberSectionsSetting on />
        <RememberSectionsSetting on={false} />
      </ElementSection>

      <ElementSection title="Keep Previous Versions Setting">
        <div className="ux-result-label">Game data</div>
        <KeepVersionsSetting />
        <KeepVersionsSetting value="2" size="77 MB" />
      </ElementSection>

      <ElementSection title="Faction Picker">
        <FactionPicker />
      </ElementSection>

      <ElementSection title="Background Job Modal">
        <JobModal inline title={`Installing ${EXAMPLE_SYSTEM.name}`} subtitle={`${EXAMPLE_SYSTEM.repo} · ${EXAMPLE_SYSTEM.version}`} percent={46} stepLabel="Step 3 of 4" steps={installSteps("import")} notify />
        <JobModal inline title={`Installing ${EXAMPLE_SYSTEM.name}`} subtitle={`${EXAMPLE_SYSTEM.repo} · ${EXAMPLE_SYSTEM.version}`} percent={46} stepLabel="Step 3 of 4" steps={installSteps("import")} overall={38} others={[{ title: "Updating Example System Two", detail: "Download · 4.1 MB of 29 MB", percent: 14 }, { title: "Installing Example System Three", detail: "Waiting for another install", waiting: true }, { title: "Installed Example System Four", detail: "12 factions. Ready to use.", ended: "done" }]} />
        <MobileDataNotice />
        <WifiWaitNotice />
        <JobOutcomeNotice outcome="updated" title="Updated Example System Two" body="3 rosters use this data. Check them to see which changed." />
        <JobOutcomeNotice outcome="done" title={`Installed ${EXAMPLE_SYSTEM.name}`} body="23 factions · 41 MB. Ready to use." />
        <JobOutcomeNotice outcome="failed" title={`Could not install ${EXAMPLE_SYSTEM.name}`} body="GitHub could not be reached. Check the connection and try again." />
        {/* A cancelled install keeps nothing (DEC-027): one cancelled notice, no "Install stopped · N of M" variant. */}
        <JobOutcomeNotice outcome="cancelled" title="Install cancelled" body="Nothing was installed." />
        {/* Cancel tapped: "Cancelling…" replaces the action (disabled, with a spinner) until the worker has stopped and discarded what it wrote. */}
        <JobModal inline title={`Installing ${EXAMPLE_SYSTEM.name}`} subtitle={`${EXAMPLE_SYSTEM.repo} · ${EXAMPLE_SYSTEM.version}`} percent={52} stepLabel="Step 4 of 4" steps={installSteps("import")}
          footer={<><button type="button" className="ux-job-btn destructive" disabled aria-disabled><RotateCcw size={15} className="ux-spin" aria-hidden />Cancelling…</button><button type="button" className="ux-job-btn secondary"><ChevronDown size={15} />Hide</button></>} />
      </ElementSection>

      <ElementSection title="Global Job Indicator">
        <div className="ux-elements-job-stage">
          <div className="ux-job-float">
            <JobPill inline label={`Installing ${EXAMPLE_SYSTEM.name}`} percent={46} />
            <JobPill inline label={`Installing ${EXAMPLE_SYSTEM.name}`} percent={38} count={2} />
            <JobPill inline needsYou label={`Choose factions for ${EXAMPLE_SYSTEM.name}`} />
            <JobPill inline wifi label={`Waiting for Wi-Fi · ${EXAMPLE_SYSTEM.name}`} />
          </div>
          <small className="ux-hint">Placement: 12 pt above the tab bar on tab screens; above the bottom safe area on pushed screens and in the roster workbench.</small>
          <div className="ux-elements-command-wrap ux-elements-job-placement">
            <div className="ux-job-float"><JobPill inline label={`Installing ${EXAMPLE_SYSTEM.name}`} percent={46} /></div>
            <nav className="ux-tabbar floating" aria-label="Main navigation (placement example)">
              <button type="button" className="ux-tab active"><Layers size={20} /><span>Lists</span></button>
              <button type="button" className="ux-tab"><Search size={20} /><span>Lookup</span></button>
              <button type="button" className="ux-tab ux-tab-fab" aria-label="New roster"><Plus size={22} /></button>
              <button type="button" className="ux-tab"><Hammer size={20} /><span>Tools</span></button>
              <button type="button" className="ux-tab"><LibraryBig size={20} /><span>Library</span></button>
            </nav>
          </div>
        </div>
      </ElementSection>

      <ElementSection title="Job Toasts">
        <div className="ux-elements-job-stage">
          <div className="ux-job-float">
            <JobToast tone="ok" message={`Installed ${EXAMPLE_SYSTEM.name}`} action="View" />
            <JobToast tone="ok" message="Updated Example System Two" action="Check rosters" />
            <JobToast tone="ok" message="Checked 3 rosters · 1 changed" action="Report" />
            <JobToast tone="err" message={`Could not install ${EXAMPLE_SYSTEM.name}`} action="Details" />
            <JobToast tone="neutral" message="Using mobile data · 18.0 MB. You can limit downloads to Wi-Fi in Settings." action="Wi-Fi only" />
          </div>
        </div>
      </ElementSection>

      <ElementSection title="OS Job Progress">
        <div className="ux-os-stage ux-os-inline"><OsJobNotifications /></div>
      </ElementSection>

      <ElementSection title="Read-only Roster Banner">
        <ReadOnlyBanner kind="source" />
        <ReadOnlyBanner kind="faction" />
        <ReadOnlyBanner kind="faction" kept={false} />
        <ReadOnlyBanner kind="changed" expanded />
        <OpenedWithVersionNotice />
      </ElementSection>

      <ElementSection title="Read-only Chip Row">
        <ReadOnlyChips kind="source" />
        <ReadOnlyChips kind="faction" />
        <ReadOnlyChips kind="changed" />
        <ReadOnlyChips readOnly={false} kind="changed" />
      </ElementSection>

      <ElementSection title="Stored Roster Outline">
        <StoredTotals kind="source" />
        <StoredOutline kind="source" />
        <StoredOutline kind="faction" />
      </ElementSection>

      <ElementSection title="Roster Data Tags">
        <div className="ux-src-chips"><RosterDataTag kind="changed" /><RosterDataTag kind="faction" /><RosterDataTag kind="source" /></div>
        <TaggedRosterRows />
      </ElementSection>

      <ElementSection title="Tools Workflow">
        <div className="ux-tools-grid ux-tools-grid-large">
          {[
            ["Roster analytics", "Shape, totals, and matchup posture", <BarChart3 size={18} />],
            ["Comparison", "Compare several entries side by side", <Scale size={18} />],
            ["Game tracker", "Roster game mode, rounds, and notes", <Gamepad2 size={18} />],
            ["Dice simulator", "Roll N dice with common side counts", <Dice5 size={18} />],
          ].map(([label, helper, icon]) => (
            <button key={label as string} type="button" className="ux-tool-tile">
              <span className="ux-setting-icon">
                {icon}
              </span>
              <span>
                <strong>{label}</strong>
                <small>{helper}</small>
              </span>
            </button>
          ))}
        </div>
        <div className="ux-analytics-card">
          <svg className="ux-radar-chart" viewBox="0 0 184 184" role="img" aria-label="Roster analytics radar">
            <polygon points="92,22 158.6,70.4 133.1,148.6 50.9,148.6 25.4,70.4" className="ux-radar-ring" />
            <line x1="92" y1="92" x2="92" y2="22" className="ux-radar-axis" />
            <line x1="92" y1="92" x2="158.6" y2="70.4" className="ux-radar-axis" />
            <line x1="92" y1="92" x2="133.1" y2="148.6" className="ux-radar-axis" />
            <line x1="92" y1="92" x2="50.9" y2="148.6" className="ux-radar-axis" />
            <line x1="92" y1="92" x2="25.4" y2="70.4" className="ux-radar-axis" />
            <polygon points="92,47 132,79 120,130 60,136 52,79" className="ux-radar-fill" />
          </svg>
          <div className="ux-stat-grid">
            <div className="ux-tool-stat"><strong>{flattenUnits(roster).length}</strong><small>Units</small></div>
            <div className="ux-tool-stat"><strong>{countSections(roster)}</strong><small>Sections</small></div>
          </div>
        </div>
        <section className="ux-compare-table">
          <div className="ux-compare-head"><span>Entry</span><span>Pts</span><span>Models</span><span>Status</span></div>
          {[selectedUnit, roster.forces[0].sections[0].units[0]].filter(Boolean).map((unit) => (
            <button key={unit.id} type="button" className="ux-compare-row">
              <span><strong>{unit.name}</strong><small>{unit.role}</small></span>
              <b>{unit.points}</b>
              <b>{unit.count}</b>
              <Check size={15} />
            </button>
          ))}
        </section>
        <section className="ux-note-composer">
          <span><strong>Round note</strong><small>Pin a note and attach table photos</small></span>
          <button type="button" aria-label="Add image"><ImagePlus size={18} /></button>
        </section>
        <div className="ux-dice-stage">
          {[6, 2, 5].map((value, index) => <span key={`${value}-${index}`} className="ux-die">{value}</span>)}
        </div>
      </ElementSection>

      <ElementSection title="Roster Import">
        <div className="ux-lists-actions"><div><strong>Your rosters</strong><small>Import a New Recruit JSON file</small></div><button type="button" className="ux-organizer-toggle" aria-label="Import a roster file"><Upload size={15} />Import</button><button type="button" className="ux-organizer-toggle" disabled aria-busy="true"><RotateCcw className="ux-spin" size={15} />Importing…</button></div>
        <div className="ux-state-matrix">
          <article className="ux-state-card"><span className="ux-state-dot" aria-hidden /><strong>Imported</strong><small>The roster opens in the editor.</small></article>
          <article className="ux-state-card offline"><span className="ux-state-dot" aria-hidden /><strong>Imported with gaps</strong><small>3 parts could not be matched to the installed data.</small></article>
          <article className="ux-state-card error"><span className="ux-state-dot" aria-hidden /><strong>Data missing</strong><small>Install this roster's game system in Sources first.</small></article>
          <article className="ux-state-card error"><span className="ux-state-dot" aria-hidden /><strong>Not a roster file</strong><small>Choose a New Recruit JSON export.</small><button type="button">Try again</button></article>
        </div>
      </ElementSection>

      <ElementSection title="Export Sheet">
        <div className="ux-prototype-state"><small>Format</small><div><button type="button">New Recruit JSON</button><button type="button" className="active">Text</button></div></div>
        <article className="ux-state-card offline"><span className="ux-state-dot" aria-hidden /><strong>This roster has 2 errors</strong><small>You can still export it.</small></article>
        <pre style={{ maxHeight: 180, overflow: "auto", margin: "10px 0", padding: 10, borderRadius: 10, background: "var(--ux-surface)", border: "1px solid var(--ux-line-2)", fontSize: 11, whiteSpace: "pre-wrap" }}>{`${roster.name} [${roster.system}]\n\n## ${roster.faction}\n\nUnit one [120 pts]\n• Option A\n• Option B\n\n… 1,240 more characters`}</pre>
        <div className="ux-lists-actions"><div><strong>{roster.name}.txt</strong><small>Share or copy the full text</small></div><button type="button" className="ux-organizer-toggle"><Copy size={15} />Copy</button><button type="button" className="ux-new-roster ux-new-roster-compact"><Upload size={18} /><span><strong>Share</strong></span></button></div>
        <ReadOnlyExportSheet inline />
        <ReadOnlyExportSheet inline snapshot={false} />
      </ElementSection>

      <ElementSection title="Favorite Library Cards">
        <section className="ux-favorite-library-section"><header><span className="ux-collection-icon"><Heart size={18} /></span><strong>Favorite units</strong></header><div className="ux-favorite-card-list"><article className="ux-favorite-card"><span><strong>Veteran Spearhead</strong><small>Core · {selectedUnit.points} pts</small></span><div><button type="button"><Plus size={14} />Add</button><button type="button"><Trash2 size={14} /></button></div></article></div></section>
      </ElementSection>

      <ElementSection title="App & Account">
        <section className="ux-account-card">
          <span className="ux-account-avatar"><UserRound size={22} /></span>
          <span>
            <strong>Alex Morgan</strong>
            <small>alex@example.com</small>
          </span>
        </section>
        <button type="button" className="ux-app-nav-row">
          <span className="ux-setting-icon"><Cog size={17} /></span>
          <span>
            <strong>Settings</strong>
            <small>Search, assistance, and sources</small>
          </span>
          <ChevronRight size={17} />
        </button>
        <div className="ux-app-footer ux-elements-app-footer">
          <strong>Roster Builder</strong>
          <small>Version 1.0.0</small>
        </div>
      </ElementSection>

      <ElementSection title="Avatar Update Badge">
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <UpdateAvatarButton />
          <UpdateAvatarButton updates={1} />
          <UpdateAvatarButton updates={3} />
        </div>
        <small className="ux-elements-note">Tab header avatar: no dot without updates; with updates a dot in the info colour ringed in the header colour. The dot is a hint only: the button's label says the count ("App, settings and sources, 3 updates available").</small>
      </ElementSection>

      <ElementSection title="App Sources Row Count">
        <SourcesNavRow />
        <SourcesNavRow updates={1} />
        <SourcesNavRow updates={3} />
        <small className="ux-elements-note">App → Sources: with updates, a chip with the update icon and the words "1 update" / "3 updates" before the chevron. Shown whichever check found the updates.</small>
      </ElementSection>

      <ElementSection title="Coming Soon Placeholder">
        <ComingSoonCard />
      </ElementSection>

      <ElementSection title="Developer Options">
        <DeveloperOptionsPreview />
      </ElementSection>

      <ElementSection title="Main Tab Bar">
        <div className="ux-elements-command-wrap">
          <nav className="ux-tabbar floating" aria-label="Main navigation">
            <button type="button" className="ux-tab active">
              <Layers size={20} />
              <span>Lists</span>
            </button>
            <button type="button" className="ux-tab">
              <Search size={20} />
              <span>Lookup</span>
            </button>
            <button type="button" className="ux-tab ux-tab-fab" aria-label="Add unit">
              <Plus size={22} />
            </button>
            <button type="button" className="ux-tab">
              <Hammer size={20} />
              <span>Tools</span>
            </button>
            <button type="button" className="ux-tab">
              <LibraryBig size={20} />
              <span>Library</span>
            </button>
          </nav>
        </div>
      </ElementSection>

      <StateMatrixElement />
      </CatalogGroup>

      <CatalogGroup groupId="gallery-ui">
      <ElementSection title="Design Library Navigation"><LibrarySwitch current="phone" label="Design library examples" /></ElementSection>
      <ElementSection title="Designer Rail Controls">
        <div className="rail-actions">
          <button className="rail-icon-button" type="button" aria-label="Screenshot">
            <Download size={17} />
          </button>
          <details className="archive-menu">
            <summary className="rail-icon-button">
              <Archive size={17} />
            </summary>
          </details>
        </div>
        <div className="view-icon-switch" role="group" aria-label="View">
          <button className="active" type="button" aria-label="Single">
            <Smartphone size={18} />
          </button>
          <button type="button" aria-label="All screens">
            <Rows3 size={18} />
          </button>
          <button type="button" aria-label="Elements">
            <PanelsTopLeft size={18} />
          </button>
        </div>
        <button className="display-switch-row" type="button" role="switch" aria-checked="true">
          <span>Design background</span>
          <span className="display-switch" aria-hidden="true" />
        </button>
        <details className="rail-disclosure workflow-editor" open>
          <summary>
            <h3>Workflow editor</h3>
          </summary>
          <button className="workflow-add-button" type="button">
            <Plus size={15} />
            Add workflow
          </button>
          <div className="screen-move-row">
            <span>
              <strong>Lookup</strong>
              <small>source</small>
            </span>
            <select value="lookup" onChange={() => undefined}>
              <option value="lookup">Lookup</option>
            </select>
            <button type="button" aria-label="Trash">
              <Trash2 size={14} />
            </button>
          </div>
        </details>
      </ElementSection>

      <ElementSection title="Workflow Board Group">
        <section className="workflow-board-group">
          <h2>Add & configure units</h2>
          <div className="workflow-board-label">Add unit</div>
        </section>
      </ElementSection>

      <ElementSection title="Glance Comments">
        <div className="glance-device-target" style={{ minHeight: 180, borderRadius: 18, background: "rgba(13, 17, 22, 0.94)" }}>
          <button type="button" className="comment-marker active" style={{ left: "42%", top: "38%" }}>
            C
          </button>
          <button type="button" className="comment-marker done" style={{ left: "62%", top: "62%" }}>
            E
          </button>
          <div className="comment-popover" style={{ left: "42%", top: "38%" }}>
            <textarea value="This is comment" onChange={() => undefined} />
            <small>button .ux-new-roster "New roster"</small>
            <div className="comment-actions">
              <button type="button">Save</button>
              <button type="button">Done</button>
              <button type="button" aria-label="Delete comment">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>
      </ElementSection>

      <ElementSection title="Comments List">
        <aside className="comments-drawer" style={{ maxHeight: "none" }}>
          <h3>Comments</h3>
          <article className="comment-list-row active">
            <button type="button" className="comment-row-head">
              <span>
                <MessageCircle size={14} />
              </span>
              <strong>Lists</strong>
              <small>point</small>
            </button>
            <textarea value="Clarify the empty state copy." onChange={() => undefined} />
            <div className="comment-actions">
              <button type="button">Done</button>
              <button type="button">Remove</button>
            </div>
          </article>
          <article className="comment-list-row done">
            <button type="button" className="comment-row-head">
              <span>
                <Check size={14} />
              </span>
              <strong>Tools</strong>
              <small>element</small>
            </button>
            <textarea value="Resolved visual spacing note." onChange={() => undefined} />
          </article>
        </aside>
      </ElementSection>

      <ElementSection title="Floating Command Bar">
        <div className="ux-elements-command-wrap">
          <div className="ux-cmd-bar">
            <button type="button" className="ux-cmd-tab" aria-label="Build">
              <Layers size={18} />
            </button>
            <button type="button" className="ux-cmd-input">
              <Command size={16} />
              <span>Add unit or ask for help...</span>
            </button>
            <button type="button" className="ux-cmd-send" aria-label="Run">
              <ArrowUp size={18} />
            </button>
          </div>
        </div>
      </ElementSection>
      </CatalogGroup>
    </>
  );
}

function TabletWorkspaceElement({ roster }: { roster: Roster }) {
  const pointsLeft = Math.max(0, roster.pointsLimit - roster.pointsUsed);
  const progress = Math.min(100, (roster.pointsUsed / roster.pointsLimit) * 100);

  return (
    <ElementSection title="Tablet Workspace Controls">
      <div className="ux-elements-tablet-workspace">
        <header className="ux-elements-tablet-navbar">
          <button type="button" className="ux-icon-btn" aria-label="Lists"><Layers size={17} /></button>
          <label className="ux-navbar-search">
            <Search size={15} />
            <input value="bastion" aria-label="Search roster" readOnly />
            <X size={15} />
          </label>
          <span className="ux-roster-header-points"><b>{roster.pointsUsed} / {roster.pointsLimit}</b><small>{pointsLeft} pts left</small></span>
          <button type="button" className="ux-icon-btn" aria-label="Workspace layout"><PanelsTopLeft size={17} /></button>
          <span className="ux-elements-progress"><i style={{ width: `${progress}%` }} /></span>
        </header>

        <div className="ux-elements-workspace-body">
          <aside className="ux-elements-pane"><strong>Roster</strong><small>Forces and units</small></aside>
          <div className="ux-pane-divider" role="separator" aria-label="Resize roster panel">
            <GripVertical size={13} />
            <button type="button" aria-label="Hide roster panel"><ChevronLeft size={13} /></button>
          </div>
          <main className="ux-elements-pane detail"><strong>Detail</strong><small>Selected unit workspace</small></main>
          <div className="ux-pane-divider collapsed" role="separator" aria-label="Restore validation panel">
            <GripVertical size={13} />
            <button type="button" aria-label="Restore validation panel"><ChevronLeft size={13} /></button>
          </div>
          <aside className="ux-elements-pane collapsed"><strong>Validation</strong></aside>
        </div>

        <div className="ux-elements-layout-menu">
          <button type="button"><Maximize2 size={14} /> Focus Detail</button>
          <button type="button"><PanelsTopLeft size={14} /> Restore three panels</button>
          <button type="button"><RotateCcw size={14} /> Reset widths</button>
        </div>

        <div className="ux-elements-dock-preview">
          <button type="button" className="ux-dock-handle" aria-label="Show navigation"><span /></button>
          <nav className="ux-elements-mini-dock" aria-label="Tablet navigation">
            <button type="button"><Layers size={17} /><small>Lists</small></button>
            <button type="button"><Search size={17} /><small>Lookup</small></button>
            <button type="button"><Hammer size={17} /><small>Tools</small></button>
          </nav>
        </div>
      </div>
    </ElementSection>
  );
}

function OptionsSection({ selectedUnit, onToggleOption }: { selectedUnit: RosterUnit; onToggleOption: (id: string) => void }) {
  return (
    <ElementSection title="Options">
      <div className="ux-opt-groups">
        {(["weapon", "upgrade", "rule"] as const).map((group) => {
          const options = selectedUnit.options.filter((option) => option.group === group);
          if (!options.length) return null;
          return (
            <section className="ux-opt-group" key={group}>
              <h4>{group === "weapon" ? "Equipment" : group === "upgrade" ? "Upgrades" : "Special rules"}</h4>
              {options.map((option) => (
                <button key={option.id} type="button" className={`ux-opt-row ${option.selected ? "on" : ""}`} onClick={() => onToggleOption(option.id)}>
                  <span className="ux-opt-check" aria-hidden />
                  <span>{option.name}</span>
                  <em>{priceLabel(option.points)}</em>
                </button>
              ))}
            </section>
          );
        })}
      </div>
    </ElementSection>
  );
}

function UnitProfilesElement({ unit }: { unit: RosterUnit }) {
  const table = unit.detail?.profileTables[0];
  const row = table?.rows[0];
  if (!table || !row) return null;
  const compactColumns = table.columns.slice(0, 8);
  return (
    <ElementSection title="Unit Profiles">
      <div className="ux-profile-table-scroll">
        <table className="ux-profile-table">
          <thead>
            <tr>{compactColumns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr>
          </thead>
          <tbody className="ux-profile-row-group">
            <tr className="ux-profile-row-name">
              <th scope="rowgroup" colSpan={compactColumns.length}><strong>{row.name}</strong><small>{row.tags?.join(" · ")}</small></th>
            </tr>
            <tr className="ux-profile-row-stats">
              {row.values.slice(0, compactColumns.length).map((value, index) => <td key={compactColumns[index]}>{value}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </ElementSection>
  );
}

function ReferenceGlancesElement({ unit }: { unit: RosterUnit }) {
  const reference = mockRosterReferences.find((item) => item.id === "pistol") ?? mockRosterReferences[0];
  const related = (reference.relatedIds ?? []).map(referenceById).filter(Boolean);
  return (
    <ElementSection title="Reference Glances">
      <div className="ux-reference-glance-stack ux-elements-static has-second">
        <section className="ux-reference-glance-card unit under" aria-hidden="true">
          <header><span><small>Unit profile</small><strong>{unit.customName ?? unit.name}</strong></span><button type="button" aria-label="Close unit glance"><X size={18} /></button></header>
          <div className="ux-reference-glance-body">
            <div className="ux-unit-profile in-glance">
              <details className="ux-profile-section" open><summary><strong>Traits</strong><ChevronDown size={15} /></summary><div className="ux-profile-section-body"><div className="ux-profile-tag-list">{unit.detail?.traits.slice(0, 3).map((trait) => <button type="button" className="ux-reference-tag" key={trait}>{trait}</button>)}</div></div></details>
              <details className="ux-profile-section" open><summary><strong>Rules</strong><ChevronDown size={15} /></summary><div className="ux-profile-section-body"><div className="ux-profile-tag-list">{unit.detail?.rules.slice(0, 5).map((rule) => <button type="button" className="ux-reference-tag" key={rule}>{rule}</button>)}</div></div></details>
            </div>
          </div>
        </section>
        <section className="ux-reference-glance-card reference active" role="dialog" aria-label={`${reference.label} reference glance`}>
          <header><span><small>{reference.kind}</small><strong>{reference.label}</strong></span><button type="button" aria-label="Close reference glance"><X size={18} /></button></header>
          <div className="ux-reference-glance-body"><article className="ux-reference-definition"><section><strong>Description</strong><p>{reference.description}</p></section><section><strong>Related</strong><div className="ux-profile-tag-list">{related.map((item) => item ? <button type="button" className="ux-reference-tag" key={item.id}>{item.label}</button> : null)}</div></section></article></div>
        </section>
      </div>
    </ElementSection>
  );
}

function LoadoutEditorElement({ unit }: { unit: RosterUnit }) {
  const group = unit.detail?.loadoutGroups.find((item) => item.canSplit) ?? unit.detail?.loadoutGroups[0];
  const slot = group?.slots.find((item) => item.id === "melee") ?? group?.slots[0];
  if (!group || !slot) return null;
  return (
    <ElementSection title="Loadout Groups & Selector">
      <article className="ux-loadout-group expanded">
        <header className="ux-loadout-group-head">
          <button type="button" className="ux-loadout-group-toggle" aria-expanded="true">
            <span><strong>{group.name} ×{group.count}</strong><small>Service pistol · Serrated sword</small></span>
            <span className="ux-loadout-group-meta"><small>{group.count * group.basePointsPerModel} pts</small><ChevronDown size={15} /></span>
          </button>
          <div className="ux-loadout-group-actions">
            <div className="ux-loadout-count-controls">
              <button type="button" aria-label={`Decrease ${group.name} count`}><Minus size={13} /></button>
              <strong>{group.count}</strong>
              <button type="button" aria-label={`Increase ${group.name} count`}><Plus size={13} /></button>
            </div>
            <button type="button" className="ux-loadout-split" aria-label={`Split one ${group.name}`} title="Split one model into a new group"><Split size={14} /></button>
          </div>
        </header>
        <div className="ux-loadout-slots">
          {group.slots.map((item) => {
            const choice = item.choices.find((candidate) => candidate.id === item.selectedChoiceId);
            return choice ? (
              <button type="button" className="ux-loadout-slot" key={item.id}>
                <small>{item.label}</small><strong>{choice.name}</strong><em>{choice.points ? `+${choice.points} pts` : "Included"}</em><ChevronRight size={15} />
              </button>
            ) : null;
          })}
        </div>
      </article>
      <div className="ux-loadout-selector-layer ux-elements-static">
        <section className="ux-loadout-selector" role="dialog" aria-modal="true" aria-label={`Choose ${slot.label.toLowerCase()}`}>
          <header><span><strong>Choose {slot.label.toLowerCase()}</strong><small>{group.name} ×{group.count}</small></span><button type="button" aria-label="Close selector"><X size={18} /></button></header>
          <label className="ux-loadout-selector-search"><Search size={15} /><input placeholder={`Search ${slot.label.toLowerCase()} choices`} readOnly /></label>
          <div className="ux-loadout-choice-list">
            {slot.choices.map((choice) => {
              const selected = choice.id === slot.selectedChoiceId;
              return (
                <button type="button" className={`ux-loadout-choice ${selected ? "selected" : ""}`} key={choice.id}>
                  <span><strong>{choice.name}</strong><small>{choice.points ? `+${choice.points} pts per model` : "Included"}</small></span>
                  <span className="ux-loadout-choice-check" aria-hidden>{selected ? <Check size={15} /> : null}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </ElementSection>
  );
}

function ForceEntriesElement({ roster }: { roster: Roster }) {
  return (
    <ElementSection title="Force Entries & Creation">
      <div className="ux-force-list ux-elements-force-list">
        {roster.forces.map((force, index) => (
          <section className={`ux-force-entry ${index === 0 ? "open selected" : ""}`} key={force.id}>
            <button type="button" className="ux-force-summary" aria-expanded={index === 0}>
              <ChevronDown size={15} />
              <span><strong>{force.name}</strong><small>{force.detachment}</small></span>
              <b>{force.points} pts</b>
            </button>
          </section>
        ))}
      </div>
      <button type="button" className="ux-force-add"><Plus size={14} />Add force</button>
      <section className="ux-force-draft" aria-label="New force">
        <header><strong>New force</strong><button type="button" aria-label="Cancel force creation"><X size={15} /></button></header>
        <label><span>Force</span><select defaultValue="free-cities"><option value="free-cities">Free Cities</option></select></label>
        <label><span>Layout</span><select defaultValue="frontier"><option value="frontier">Frontier Force Layout Chart</option></select></label>
        <div className="ux-force-draft-actions"><button type="button">Cancel</button><button type="button" className="primary">Add force</button></div>
      </section>
      <div className="ux-force-selector-layer ux-elements-static">
        <section className="ux-force-selector" role="dialog" aria-modal="true" aria-label="Add force">
          <header><span><strong>Add force</strong><small>To Primary Force</small></span><button type="button" aria-label="Close force selector"><X size={18} /></button></header>
          <div className="ux-force-selector-body">
            <label className="ux-loadout-selector-search"><Search size={15} /><input placeholder="Search forces" readOnly /></label>
            {/* Plan 4C: one tap adds and closes. */}
            <div className="ux-force-detachments"><strong>Detachments in Primary Force</strong><button type="button"><span><b>Core Detachment<em className="ux-force-required" aria-label="Required"> !</em></b><small>Required · 0/1</small></span><Plus size={15} /></button><button type="button"><span><b>Support Detachment</b><small>At maximum · 1/1: adding breaks its limit</small></span><Plus size={15} /></button></div>
            <button type="button" className="ux-force-faction-select" aria-expanded={false}><span><strong>Faction</strong><small>Faction A</small></span><ChevronRight size={16} /></button>
            <strong className="ux-force-section-title">Layout</strong>
            <div className="ux-force-choice-list"><button type="button"><span><strong>Standard Force (1)</strong><small>Recommended</small></span><Plus size={15} /></button><button type="button"><span><strong>Open Force (0)</strong><small>Sandbox</small></span><Plus size={15} /></button></div>
            <button type="button" className="ux-pool-hidden">Show hidden (3)</button>
          </div>
          <footer><button type="button">Close</button></footer>
        </section>
      </div>
    </ElementSection>
  );
}

const ElementCatalogContext = createContext<DesignElements | null>(null);

function CatalogSummary({ groups }: { groups: DesignElementGroup[] }) {
  const product = groups.find((group) => group.id === "product-ui");
  const ready = product?.sections.filter((section) => section.status === "ready-for-rn").length ?? 0;
  const coveredScreens = new Set(product?.sections.flatMap((section) => section.screens) ?? []);
  return (
    <aside className="ux-catalog-summary" aria-label="V1 React Native handoff summary">
      <div><strong>{product?.sections.length ?? 0}</strong><small>Product specifications</small></div>
      <div><strong>{ready}</strong><small>Ready for RN</small></div>
      <div><strong>{coveredScreens.size}</strong><small>Screens covered</small></div>
      <div><strong>{groups.find((group) => group.id === "gallery-ui")?.sections.length ?? 0}</strong><small>Gallery-only tools</small></div>
    </aside>
  );
}

function CatalogGroup({ groupId, continuation = false, children }: { groupId: DesignElementGroup["id"]; continuation?: boolean; children: React.ReactNode }) {
  const catalog = useContext(ElementCatalogContext);
  const group = catalog?.groups.find((candidate) => candidate.id === groupId);
  return (
    <section className={`ux-catalog-group ${groupId}`} aria-label={group?.label}>
      {!continuation && group ? (
        <header className="ux-catalog-group-head">
          <span>{groupId === "product-ui" ? "React Native target" : "Web gallery only"}</span>
          <h2>{group.label}</h2>
          <p>{group.description}</p>
        </header>
      ) : null}
      {children}
    </section>
  );
}

function StateMatrixElement() {
  const states = [
    ["Loading", "Updating roster…", "loading"],
    ["Empty", "No units match these filters.", "empty"],
    ["Offline", "Showing saved roster data.", "offline"],
    ["Error", "Couldn’t update the roster.", "error"],
    ["Disabled", "Unavailable for this force.", "disabled"],
    ["Subscriber", "Supporter feature", "locked"],
  ];
  return (
    <ElementSection title="Component State Matrix">
      <div className="ux-state-matrix">
        {states.map(([title, copy, state]) => (
          <article className={`ux-state-card ${state}`} key={state}>
            <span className="ux-state-dot" aria-hidden />
            <strong>{title}</strong>
            <small>{copy}</small>
            {state === "error" || state === "offline" ? <button type="button">Try again</button> : null}
          </article>
        ))}
      </div>
    </ElementSection>
  );
}

function ElementSection({ title, children }: { title: string; children: React.ReactNode }) {
  const catalog = useContext(ElementCatalogContext);
  const specification = catalog?.groups.flatMap((group) => group.sections).find((section) => section.title === title);
  return (
    <article className="element-section ux-element-section" data-element-id={specification?.id}>
      <header className="ux-element-heading">
        <div>
          <h2>{title}</h2>
          {specification ? <code>{specification.id}</code> : null}
        </div>
        {specification ? (
          <div className="ux-element-badges" aria-label="Component specification status">
            <span>{specification.level}</span>
            <span className={`status-${specification.status}`}>{specification.status}</span>
            <span>{specification.platforms.join(" + ")}</span>
          </div>
        ) : null}
      </header>
      {specification ? (
        <details className="ux-element-spec">
          <summary>React Native handoff · {specification.states.length} states · {specification.screens.length || "shared"} screen{specification.screens.length === 1 ? "" : "s"}</summary>
          <div>
            <p><strong>States</strong><span>{specification.states.join(" · ")}</span></p>
            <p><strong>Coverage</strong><span>{specification.screens.length ? specification.screens.join(" · ") : "Shared foundation"}</span></p>
            {specification.reactNative ? <p><strong>Component</strong><span><code>{specification.reactNative.component}</code> — {specification.reactNative.behavior}</span></p> : <p><strong>Implementation</strong><span>Gallery-only; exclude from the mobile application.</span></p>}
            {specification.reactNative ? <p><strong>Accessibility</strong><span>{specification.reactNative.accessibility}</span></p> : null}
          </div>
        </details>
      ) : null}
      {children}
    </article>
  );
}

/** UX-002 (2026-10-21): synthetic 58-slot force. Every section the force can take is listed; unavailable ones never become rows. */
function ManySlotsElement() {
  const slots = [
    { name: "Configuration", usage: "1/1", note: "Option A" },
    { name: "Required slot", usage: "0/1", note: "Below minimum" },
    { name: "Occupied slot", usage: "1/0", note: "Above maximum · Unit A" },
    { name: "Cost-limited slot", usage: "0/0", note: "Cost limit exceeded" },
    ...Array.from({ length: 11 }, (_, i) => ({ name: `Optional slot ${i + 1}`, usage: "0/4", note: "+ Add unit" })),
  ];
  return <div className="ux-force-sections" aria-label="Many-slot force">
    <p>58 slots: the 15 sections this force can take are listed, empty or not (occupied, required, broken, and 11 empty sections with entries to add). The 43 sections it cannot take (maximum 0 or nothing to add) are never shown. No Show all slots control.</p>
    {slots.map(slot => <div className="ux-tree-branch" key={slot.name}>
      <div className="ux-tree-section"><ChevronDown size={14} /><strong>{slot.name}</strong><small>{slot.usage}</small></div>
      {slot.note ? <small>{slot.note}</small> : null}
    </div>)}
    <p>Configuration and nested forces retain their order; collapse choices survive model updates while the roster is open.</p>
  </div>;
}
