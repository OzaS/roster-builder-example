import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { Camera, Check, Eye, EyeOff, ListChecks, MessageCircle, MousePointer2, Trash2, X } from "lucide-react";
import { DeviceFrame } from "../components/DeviceFrame";
import type { ConceptProps } from "../concepts/shared";
import type { DesignComment, EditableDesign } from "../design-data/designData";
import { screenLabel } from "../design-data/designData";
import type { GalleryConcept } from "./galleryTypes";
import { workflowToPrototypeScreen } from "./workflow";
import { captureElementAsPng } from "../utils/captureStage";
import type { ColorScheme, NavStyle, PlatformPreview, Roster, RosterSection, RosterUnit, ThemeMode, WorkflowScreen } from "../types";

export type GlancePlacement = {
  x: number;
  y: number;
  mode: DesignComment["mode"];
  elementHint?: string;
};

type Props = {
  concept: GalleryConcept;
  design?: EditableDesign;
  screen: WorkflowScreen;
  platform: PlatformPreview;
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  roster: Roster;
  selectedSection: RosterSection;
  selectedUnit: RosterUnit;
  selectedSectionId: string;
  expandedSectionIds: string[];
  smartSearch: boolean;
  navStyle: NavStyle;
  initialPlacement?: GlancePlacement;
  onClose: () => void;
  onScreenChange: (screen: WorkflowScreen) => void;
  onCommentsChange: (comments: DesignComment[]) => void;
  onToggleSmartSearch: () => void;
  onSelectSection: (id: string) => void;
  onToggleSection: (id: string) => void;
  onSelectUnit: (id: string) => void;
  onToggleOption: (id: string) => void;
  onCountChange: (id: string, delta: number) => void;
  onNavigate: ConceptProps["onNavigate"];
  onBack: () => void;
};

export function ScreenGlance({
  concept,
  design,
  screen,
  platform,
  themeMode,
  colorScheme,
  roster,
  selectedSection,
  selectedUnit,
  selectedSectionId,
  expandedSectionIds,
  smartSearch,
  navStyle,
  initialPlacement,
  onClose,
  onScreenChange,
  onCommentsChange,
  onToggleSmartSearch,
  onSelectSection,
  onToggleSection,
  onSelectUnit,
  onToggleOption,
  onCountChange,
  onNavigate,
  onBack,
}: Props) {
  const [armed, setArmed] = useState<null | DesignComment["mode"]>(initialPlacement ? initialPlacement.mode : null);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(true);
  const [commentsVisible, setCommentsVisible] = useState(true);
  const [hiddenCommentIds, setHiddenCommentIds] = useState<Set<string>>(() => new Set());
  const [draftText, setDraftText] = useState("");
  const deviceCaptureRef = useRef<HTMLDivElement>(null);
  const Component = concept.component;
  const comments = design?.comments ?? [];
  const screenComments = comments.filter((comment) => comment.screen === screen);
  const activeComment = comments.find((comment) => comment.id === activeCommentId);
  const visibleScreenComments = commentsVisible ? screenComments.filter((comment) => !hiddenCommentIds.has(comment.id)) : [];
  const activeCommentVisible = activeComment && commentsVisible && !hiddenCommentIds.has(activeComment.id);

  useEffect(() => {
    if (initialPlacement) {
      const comment = createComment(screen, initialPlacement, "New comment");
      onCommentsChange([...comments, comment]);
      setActiveCommentId(comment.id);
      setDraftText(comment.text);
      setArmed(null);
    }
  }, []);

  async function captureFocusedScreen() {
    if (!deviceCaptureRef.current) return;
    await captureElementAsPng(deviceCaptureRef.current, `${concept.id}-${screen}-${platform}-glance.png`);
  }

  function placeComment(event: ReactMouseEvent<HTMLDivElement>) {
    if (!armed) return;
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const placement: GlancePlacement = {
      x: clampPercent(((event.clientX - rect.left) / rect.width) * 100),
      y: clampPercent(((event.clientY - rect.top) / rect.height) * 100),
      mode: event.shiftKey ? "element" : armed,
      elementHint: event.shiftKey ? elementHint(event.target) : undefined,
    };
    const comment = createComment(screen, placement, "New comment");
    onCommentsChange([...comments, comment]);
    setActiveCommentId(comment.id);
    setDraftText(comment.text);
    setArmed(null);
  }

  function saveActiveComment() {
    if (!activeComment) return;
    onCommentsChange(
      comments.map((comment) =>
        comment.id === activeComment.id ? { ...comment, text: draftText.trim() || "New comment", updatedAt: new Date().toISOString() } : comment,
      ),
    );
  }

  function toggleStatus(commentId: string) {
    onCommentsChange(
      comments.map((comment) =>
        comment.id === commentId
          ? { ...comment, status: comment.status === "done" ? "open" : "done", updatedAt: new Date().toISOString() }
          : comment,
      ),
    );
  }

  function deleteComment(commentId: string) {
    onCommentsChange(comments.filter((comment) => comment.id !== commentId));
    if (activeCommentId === commentId) setActiveCommentId(null);
    setHiddenCommentIds((current) => {
      const next = new Set(current);
      next.delete(commentId);
      return next;
    });
  }

  function toggleCommentVisibility(commentId: string) {
    setHiddenCommentIds((current) => {
      const next = new Set(current);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
        if (activeCommentId === commentId) setActiveCommentId(null);
      }
      return next;
    });
  }

  function toggleAllCommentVisibility() {
    setCommentsVisible((current) => {
      if (current) setActiveCommentId(null);
      return !current;
    });
  }

  return (
    <div className="glance-overlay" role="dialog" aria-modal="true" aria-label={`${screenLabel(design, screen)} Glance`}>
      <div className="glance-backdrop" onClick={onClose} />
      <div className="glance-stage">
        <header className="glance-toolbar">
          <div>
            <strong>{screenLabel(design, screen)}</strong>
            <small>Click Add comment, then place it on the screen. Shift-click targets the element.</small>
          </div>
          <button type="button" onClick={() => setArmed(armed ? null : "point")} className={armed ? "active" : ""}>
            <MessageCircle size={16} />
            Add comment
          </button>
          <button type="button" onClick={() => setCommentsOpen((value) => !value)} className={commentsOpen ? "active" : ""}>
            <ListChecks size={16} />
            Comments
          </button>
          <button type="button" onClick={toggleAllCommentVisibility} className={commentsVisible ? "" : "active"}>
            {commentsVisible ? <EyeOff size={16} /> : <Eye size={16} />}
            {commentsVisible ? "Hide all" : "Show all"}
          </button>
          <button type="button" className="glance-icon" onClick={captureFocusedScreen} aria-label="Capture screenshot" title="Capture screenshot">
            <Camera size={16} />
          </button>
          <button type="button" className="glance-icon" onClick={onClose} aria-label="Close Glance">
            <X size={18} />
          </button>
        </header>
        <p className="glance-tip">
          <MousePointer2 size={14} />
          Click a screen title to focus. Shift-click a screen to comment on an element.
        </p>
        <div className={`glance-layout ${commentsOpen ? "with-comments" : ""}`}>
          <div className="glance-device-shell">
            <div className="glance-device-export" ref={deviceCaptureRef}>
              <div className="glance-device-capture">
                <DeviceFrame platform={platform}>
                  <div className={`glance-device-target ${armed ? "placing" : ""}`} onClick={placeComment}>
                    <Component
                      roster={roster}
                      selectedSection={selectedSection}
                      selectedUnit={selectedUnit}
                      selectedSectionId={selectedSectionId}
                      expandedSectionIds={expandedSectionIds}
                      screen={workflowToPrototypeScreen(screen)}
                      workflowScreen={screen}
                      themeMode={themeMode}
                      colorScheme={colorScheme}
                      smartSearch={smartSearch}
                      onToggleSmartSearch={onToggleSmartSearch}
                      navStyle={navStyle}
                      canGoBack={screen !== "overview"}
                      onSelectSection={onSelectSection}
                      onToggleSection={onToggleSection}
                      onSelectUnit={onSelectUnit}
                      onToggleOption={onToggleOption}
                      onCountChange={onCountChange}
                      onNavigate={onNavigate}
                      onBack={onBack}
                    />
                  </div>
                </DeviceFrame>
                <div className="comment-overlay" aria-hidden={visibleScreenComments.length === 0 && !activeCommentVisible}>
                  {visibleScreenComments.map((comment) => (
                    <button
                      type="button"
                      key={comment.id}
                      className={`comment-marker ${comment.status} ${activeCommentId === comment.id ? "active" : ""}`}
                      style={{ left: `${comment.x}%`, top: `${comment.y}%` }}
                      onClick={(event) => {
                        event.stopPropagation();
                        setActiveCommentId(comment.id);
                        setDraftText(comment.text);
                      }}
                      aria-label="Open comment"
                    >
                      {comment.mode === "element" ? "E" : "C"}
                    </button>
                  ))}
                  {activeCommentVisible ? (
                    <div
                      className={`comment-popover ${activeComment.status}`}
                      style={{ left: `${activeComment.x}%`, top: `${activeComment.y}%` }}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <textarea value={draftText} onChange={(event) => setDraftText(event.currentTarget.value)} />
                      {activeComment.elementHint ? <small>{activeComment.elementHint}</small> : null}
                      <div className="comment-actions">
                        <button type="button" onClick={(event) => {
                          event.stopPropagation();
                          saveActiveComment();
                        }}>Save</button>
                        <button type="button" onClick={(event) => {
                          event.stopPropagation();
                          toggleStatus(activeComment.id);
                        }}>
                          {activeComment.status === "done" ? "Open" : "Done"}
                        </button>
                        <button type="button" onClick={(event) => {
                          event.stopPropagation();
                          toggleCommentVisibility(activeComment.id);
                        }}>
                          Hide
                        </button>
                        <button type="button" onClick={(event) => {
                          event.stopPropagation();
                          deleteComment(activeComment.id);
                        }} aria-label="Delete comment">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          {commentsOpen ? (
            <CommentsDrawer
              comments={comments}
              design={design}
              activeCommentId={activeCommentId}
              onSelect={(comment) => {
                onScreenChange(comment.screen);
                setActiveCommentId(comment.id);
                setDraftText(comment.text);
              }}
              onTextChange={(commentId, text) =>
                onCommentsChange(comments.map((comment) => (comment.id === commentId ? { ...comment, text, updatedAt: new Date().toISOString() } : comment)))
              }
              onToggleStatus={toggleStatus}
              onToggleVisibility={toggleCommentVisibility}
              onDelete={deleteComment}
              hiddenCommentIds={hiddenCommentIds}
              commentsVisible={commentsVisible}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CommentsDrawer({
  comments,
  design,
  activeCommentId,
  onSelect,
  onTextChange,
  onToggleStatus,
  onToggleVisibility,
  onDelete,
  hiddenCommentIds,
  commentsVisible,
}: {
  comments: DesignComment[];
  design?: EditableDesign;
  activeCommentId: string | null;
  onSelect: (comment: DesignComment) => void;
  onTextChange: (commentId: string, text: string) => void;
  onToggleStatus: (commentId: string) => void;
  onToggleVisibility: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  hiddenCommentIds: Set<string>;
  commentsVisible: boolean;
}) {
  const ordered = [...comments].sort((a, b) => Number(a.status === "done") - Number(b.status === "done"));
  return (
    <aside className="comments-drawer">
      <h3>Comments</h3>
      {ordered.length ? (
        ordered.map((comment) => (
          <article
            className={`comment-list-row ${comment.status} ${activeCommentId === comment.id ? "active" : ""} ${
              !commentsVisible || hiddenCommentIds.has(comment.id) ? "hidden-comment" : ""
            }`}
            key={comment.id}
          >
            <button type="button" className="comment-row-head" onClick={() => onSelect(comment)}>
              <span>{comment.status === "done" ? <Check size={14} /> : <MessageCircle size={14} />}</span>
              <strong>{screenLabel(design, comment.screen)}</strong>
              <small>{comment.mode}</small>
            </button>
            <textarea value={comment.text} onChange={(event) => onTextChange(comment.id, event.currentTarget.value)} />
            {comment.elementHint ? <small>{comment.elementHint}</small> : null}
            <div className="comment-actions">
              <button type="button" onClick={() => onToggleStatus(comment.id)}>{comment.status === "done" ? "Open" : "Done"}</button>
              <button type="button" onClick={() => onToggleVisibility(comment.id)}>{hiddenCommentIds.has(comment.id) ? "Show" : "Hide"}</button>
              <button type="button" onClick={() => onDelete(comment.id)}>Remove</button>
            </div>
          </article>
        ))
      ) : (
        <p className="glance-empty">No comments yet.</p>
      )}
    </aside>
  );
}

function createComment(screen: WorkflowScreen, placement: GlancePlacement, text: string): DesignComment {
  const now = new Date().toISOString();
  return {
    id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    screen,
    x: placement.x,
    y: placement.y,
    text,
    mode: placement.mode,
    status: "open",
    elementHint: placement.elementHint,
    createdAt: now,
  };
}

function clampPercent(value: number) {
  return Math.max(2, Math.min(98, value));
}

function elementHint(target: EventTarget) {
  const element = target instanceof HTMLElement ? target : null;
  if (!element) return undefined;
  const label = element.getAttribute("aria-label") || element.textContent?.trim().slice(0, 48);
  const className = typeof element.className === "string" ? element.className.split(" ").filter(Boolean).slice(0, 2).join(".") : "";
  return [element.tagName.toLowerCase(), className ? `.${className}` : "", label ? `\"${label}\"` : ""].join(" ").trim();
}
