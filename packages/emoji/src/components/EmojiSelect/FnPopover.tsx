import {EmojiPluginTheme} from "../../theme";
import {EmojiImageProps, EmojiPluginStore, EmojiSelectGroup} from "../../index";
import {EmojiStrategy} from "../../utils/createEmojisFromStrategy";
import React, {ComponentType, ReactElement, ReactNode, useCallback, useEffect, useMemo, useRef, useState} from "react";
import Groups from "./Popover/Groups";
import Nav from "./Popover/Nav";
import addEmoji from "../../modifiers/addEmoji";
import Entry from "./Popover/Entry";

interface PopoverProps {
  theme: EmojiPluginTheme;
  store: EmojiPluginStore;
  groups: EmojiSelectGroup[];
  emojis: EmojiStrategy;
  toneSelectOpenDelay: number;
  isOpen?: boolean;
  emojiImage: ComponentType<EmojiImageProps>;

  onEmojiSelect(): void;

  menuPosition?: 'top' | 'bottom';
}

function Menu({position, menuPosition, theme = {}, groups = [], activeGroup, onGroupSelect}: {
  position: string,
  menuPosition?: string,
  theme: EmojiPluginTheme,
  groups: EmojiSelectGroup[],
  activeGroup: number,
  onGroupSelect: (groupIndex: number) => void,
}) {
  if (position === (menuPosition || 'bottom'))
    return (
      <Nav
        theme={theme}
        groups={groups}
        activeGroup={activeGroup}
        onGroupSelect={onGroupSelect}
      />
    );
  return null;
}

export default function FnPopover({
                                    theme,
                                    store,
                                    groups,
                                    emojis,
                                    isOpen = false,
                                    menuPosition,
                                    onEmojiSelect,
                                  }: PopoverProps) {
  const [mouseDown, setMouseDown] = useState(false);
  const [activeGroup, setActiveGroup] = useState(0);
  const [activeEmoji, setActiveEmoji] = useState<Entry | null>(null);

  const container = useRef(null);
  const onMouseDown = useCallback((): void => {
    setMouseDown(true);
  }, [setMouseDown]);

  const handleEmojiSelect = (emoji: string): void => {
    const newEditorState = addEmoji(store.getEditorState!(), emoji);
    store.setEditorState!(newEditorState);
    onEmojiSelect();
  };

  const onEmojiMouseDown = (emojiEntry: Entry, toneSet: string[] | null): void => {
    setActiveEmoji(emojiEntry);

    if (toneSet) {
      openToneSelectWithTimer(toneSet);
    }
  };

  const onGroupSelect = useCallback((groupIndex: number): void => {
    setActiveGroup(groupIndex);
  },[setActiveGroup]);

  const checkMouseDown = useCallback(() => { return mouseDown; }, [mouseDown]);

  const openToneSelectWithTimer = (toneSet: string[] | null): void => {
    this.toneSelectTimer = setTimeout(() => {
      this.toneSelectTimer = null;
      this.openToneSelect(toneSet);
    }, this.props.toneSelectOpenDelay);
  };

  const groupMenuProps = {menuPosition, theme, groups, activeGroup, onGroupSelect}

  const className = isOpen
    ? theme.emojiSelectPopover
    : theme.emojiSelectPopoverClosed;

  return (
    <div
      className={className}
      onMouseDown={onMouseDown}
      ref={container}
    >
      {isOpen && (
        <>
          <h3 className={theme.emojiSelectPopoverTitle}>
            {groups[activeGroup].title}
          </h3>
          <Menu position='top' {...groupMenuProps} />
          <Groups
            theme={theme}
            groups={groups}
            emojis={emojis}
            checkMouseDown={checkMouseDown}
            onEmojiSelect={handleEmojiSelect}
            onEmojiMouseDown={onEmojiMouseDown}
            onGroupScroll={onGroupScroll}
            ref={element => {
              this.groupsElement = element;
            }}
            emojiImage={emojiImage}
            isOpen={isOpen}
            activeGroupIndex={activeGroup}
          />
          <Menu position='bottom' {...groupMenuProps} />
          {this.renderToneSelect()}
        </>
      )}
    </div>
  );
}
