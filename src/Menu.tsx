import React, { useEffect, useRef, useState } from 'react';
import { Editor } from '@tiptap/core';
import { Button, Popover } from 'antd';
import {
  NodeSelection,
  Plugin,
  PluginKey,
  TextSelection,
} from '@tiptap/pm/state';
import { Fragment, Slice, Node } from '@tiptap/pm/model';

// @ts-ignore
import { __serializeForClipboard, EditorView } from '@tiptap/pm/view';

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

type FloatingMenuProps = Omit<
  Optional<any, 'pluginKey'>,
  'element' | 'editor'
> & {
  editor: Editor;
  className?: string;
  children?: React.ReactNode;
};

interface GlobalDragHandleOptions {
  /**
   * The width of the drag handle
   */
  dragHandleWidth: number;

  /**
   * The treshold for scrolling
   */
  scrollTreshold: number;

  /*
   * The css selector to query for the drag handle. (eg: '.custom-handle').
   * If handle element is found, that element will be used as drag handle. If not, a default handle will be created
   */
  dragHandleSelector?: string;

  /**
   * Tags to be excluded for drag handle
   */
  excludedTags: string[];

  onClickBlock?: ({
    view,
    e,
    options,
  }: {
    view: EditorView;
    e: any; // 点击事件
    options: GlobalDragHandleOptions;
  }) => void;
}

export const FloatingMenu = (props: FloatingMenuProps) => {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const pluginKey = 'globalDragHandle';
  const { editor } = props;
  const dragHandleElement = useRef<HTMLElement | null>(null);

  function DragHandlePlugin(
    options: GlobalDragHandleOptions & { pluginKey: string }
  ) {
    let listType = '';

    function handleDragStart(event: DragEvent, view: EditorView) {
      view.focus();

      if (!event.dataTransfer) return;

      const node = nodeDOMAtCoords({
        x: event.clientX + 50 + options.dragHandleWidth,
        y: event.clientY,
      });

      if (!(node instanceof Element)) return;

      let draggedNodePos = nodePosAtDOM(node, view, options);
      if (draggedNodePos == null || draggedNodePos < 0) return;
      draggedNodePos = calcNodePos(draggedNodePos, view);

      const { from, to } = view.state.selection;
      const diff = from - to;

      const fromSelectionPos = calcNodePos(from, view);
      let differentNodeSelected = false;

      const nodePos = view.state.doc.resolve(fromSelectionPos);

      // Check if nodePos points to the top level node
      if (nodePos.node().type.name === 'doc') differentNodeSelected = true;
      else {
        const nodeSelection = NodeSelection.create(
          view.state.doc,
          nodePos.before()
        );

        // Check if the node where the drag event started is part of the current selection
        differentNodeSelected = !(
          draggedNodePos + 1 >= nodeSelection.$from.pos &&
          draggedNodePos <= nodeSelection.$to.pos
        );
      }
      let selection = view.state.selection;
      if (
        !differentNodeSelected &&
        diff !== 0 &&
        !(view.state.selection instanceof NodeSelection)
      ) {
        const endSelection = NodeSelection.create(view.state.doc, to - 1);
        selection = TextSelection.create(
          view.state.doc,
          draggedNodePos,
          endSelection.$to.pos
        );
      } else {
        selection = NodeSelection.create(view.state.doc, draggedNodePos);

        // if inline node is selected, e.g mention -> go to the parent node to select the whole node
        // if table row is selected, go to the parent node to select the whole node
        if (
          (selection as NodeSelection).node.type.isInline ||
          (selection as NodeSelection).node.type.name === 'tableRow'
        ) {
          let $pos = view.state.doc.resolve(selection.from);
          selection = NodeSelection.create(view.state.doc, $pos.before());
        }
      }
      view.dispatch(view.state.tr.setSelection(selection));

      // If the selected node is a list item, we need to save the type of the wrapping list e.g. OL or UL
      if (
        view.state.selection instanceof NodeSelection &&
        view.state.selection.node.type.name === 'listItem'
      ) {
        listType = node.parentElement!.tagName;
      }

      const slice = view.state.selection.content();
      const { dom, text } = __serializeForClipboard(view, slice);

      event.dataTransfer.clearData();
      event.dataTransfer.setData('text/html', dom.innerHTML);
      event.dataTransfer.setData('text/plain', text);
      event.dataTransfer.effectAllowed = 'copyMove';

      event.dataTransfer.setDragImage(node, 0, 0);

      view.dragging = { slice, move: event.ctrlKey };
    }
    function hideDragHandle() {
      if (dragHandleElement.current) {
        dragHandleElement.current.classList.add('hide');
        console.info('>>> hide >>>');
      }
    }
    function showDragHandle() {
      if (dragHandleElement.current) {
        dragHandleElement.current.classList.remove('hide');
      }
    }
    function hideHandleOnEditorOut(event: MouseEvent) {
      if (event.target instanceof Element) {
        const isInsideEditor = !!event.target.closest('.tiptap.ProseMirror');
        const isHandle =
          !!event.target.attributes.getNamedItem('data-drag-handle');
        if (isInsideEditor || isHandle) return;
      }
      hideDragHandle();
    }
    return new Plugin({
      key: new PluginKey(options.pluginKey),
      view: (view) => {
        const handleBySelector = options.dragHandleSelector
          ? document.querySelector<HTMLElement>(options.dragHandleSelector)
          : null;
        console.info(
          '>>> [plugin view] handleBySelector >>>',
          options.dragHandleSelector,
          handleBySelector
        );
        dragHandleElement.current =
          handleBySelector ?? document.createElement('div');
        dragHandleElement.current.draggable = true;
        dragHandleElement.current.dataset.dragHandle = '';
        dragHandleElement.current.classList.add('drag-handle');

        function onClickHandle(e: any) {
          options?.onClickBlock?.({
            view,
            e,
            options,
          });
        }
        function onDragHandleDragStart(e: DragEvent) {
          handleDragStart(e, view);
        }
        function onDragHandleDrag(e: DragEvent) {
          hideDragHandle();
          let scrollY = window.scrollY;
          if (e.clientY < options.scrollTreshold) {
            window.scrollTo({ top: scrollY - 30, behavior: 'smooth' });
          } else if (window.innerHeight - e.clientY < options.scrollTreshold) {
            window.scrollTo({ top: scrollY + 30, behavior: 'smooth' });
          }
        }

        dragHandleElement.current.addEventListener('click', onClickHandle);
        dragHandleElement.current.addEventListener(
          'dragstart',
          onDragHandleDragStart
        );
        dragHandleElement.current.addEventListener('drag', onDragHandleDrag);

        hideDragHandle();

        if (!handleBySelector) {
          view?.dom?.parentElement?.appendChild(dragHandleElement.current);
        }
        view?.dom?.parentElement?.addEventListener(
          'mouseout',
          hideHandleOnEditorOut
        );

        return {
          destroy: () => {
            if (!handleBySelector) {
              dragHandleElement.current?.remove?.();
            }
            dragHandleElement.current?.removeEventListener(
              'click',
              onClickHandle
            );
            dragHandleElement.current?.removeEventListener(
              'drag',
              onDragHandleDrag
            );
            dragHandleElement.current?.removeEventListener(
              'dragstart',
              onDragHandleDragStart
            );
            dragHandleElement.current = null;
            view?.dom?.parentElement?.removeEventListener(
              'mouseout',
              hideHandleOnEditorOut
            );
          },
        };
      },
      props: {
        handleDOMEvents: {
          // TODO: 节流
          mousemove: (view, event) => {
            if (!view.editable) return;

            // 计算出了一级DOM
            const node = nodeDOMAtCoords({
              x: event.clientX + 50 + options.dragHandleWidth,
              y: event.clientY,
            });

            // console.info('>>> node >>>', node)
            /**
             * TODO:
             * 计算可能还是不准确，只计算了往右偏移50的像素，但是如果是顶级嵌套多层的话，就不准了
             * 可能还需要往上递归找到顶级节点
             */

            if (
              // 过滤掉非元素节点
              !(node instanceof Element) ||
              // 过滤掉指定标签拖拽元素
              node.matches(
                options.excludedTags.concat(['ol', 'ul']).join(', ')
              ) ||
              // 过滤掉指定类的拖拽元素
              node?.closest('.not-draggable')
            ) {
              hideDragHandle();
              return;
            }

            // 计算小方块定位信息
            const compStyle = window.getComputedStyle(node);
            const parsedLineHeight = parseInt(compStyle.lineHeight, 10);
            const lineHeight = isNaN(parsedLineHeight)
              ? parseInt(compStyle.fontSize) * 1.2
              : parsedLineHeight;
            const paddingTop = parseInt(compStyle.paddingTop, 10);

            const rect = absoluteRect(node);

            rect.top += (lineHeight - 24) / 2;
            rect.top += paddingTop;
            // Li markers
            if (node.matches('ul:not([data-type=taskList]) li, ol li')) {
              rect.left -= options.dragHandleWidth;
            }
            rect.width = options.dragHandleWidth;

            if (!dragHandleElement.current) return;

            dragHandleElement.current.style.left = `${
              rect.left - rect.width
            }px`;
            dragHandleElement.current.style.top = `${rect.top}px`;
            showDragHandle();
          },
          keydown: () => {
            hideDragHandle();
          },
          mousewheel: () => {
            hideDragHandle();
          },
          // dragging class is used for CSS
          dragstart: (view) => {
            view.dom.classList.add('dragging');
          },
          drop: (view, event) => {
            view.dom.classList.remove('dragging');
            hideDragHandle();
            let droppedNode: Node | null = null;
            const dropPos = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            });

            if (!dropPos) return;

            if (view.state.selection instanceof NodeSelection) {
              droppedNode = view.state.selection.node;
            }
            if (!droppedNode) return;

            const resolvedPos = view.state.doc.resolve(dropPos.pos);

            const isDroppedInsideList =
              resolvedPos.parent.type.name === 'listItem';

            // If the selected node is a list item and is not dropped inside a list, we need to wrap it inside <ol> tag otherwise ol list items will be transformed into ul list item when dropped
            if (
              view.state.selection instanceof NodeSelection &&
              view.state.selection.node.type.name === 'listItem' &&
              !isDroppedInsideList &&
              listType == 'OL'
            ) {
              const newList =
                view.state.schema.nodes.orderedList?.createAndFill(
                  null,
                  droppedNode
                );
              const slice = new Slice(Fragment.from(newList), 0, 0);
              view.dragging = { slice, move: event.ctrlKey };
            }
          },
          dragend: (view) => {
            view.dom.classList.remove('dragging');
          },
        },
      },
    });
  }

  useEffect(() => {
    if (!element) return;
    if (editor?.isDestroyed) return;
    if (!editor) return;

    editor.registerPlugin(
      DragHandlePlugin({
        pluginKey: pluginKey,
        dragHandleWidth: 20,
        scrollTreshold: 100,
        excludedTags: [],
        dragHandleSelector: '.drag-handle',
        onClickBlock: ({ view, e, options }) => {
          // TODO: 动态改变plusBlock内容的动态图标
          // const node = nodeDOMAtCoords({
          //   x: e.clientX + 50 + options.dragHandleWidth,
          //   y: e.clientY,
          // });
          const nodePos = view.posAtCoords({
            left: e.clientX + 50 + options.dragHandleWidth,
            top: e.clientY,
          })!.pos;
          console.info('>>> [🟦] onClickHandle >>>', view);
          editor
            .chain()
            .setTextSelection({ from: nodePos, to: nodePos })
            .focus()
            .selectParentNode()
            .run();
        },
      })
    );
    return () => {
      editor.unregisterPlugin(pluginKey);
    };
  }, [editor, element]);

  return (
    <>
      <div
        ref={setElement}
        className={props.className}
        style={{ visibility: 'hidden' }}
      />
      <Popover
        placement="leftTop"
        content={'666'}
        title="Title"
        trigger="click"
        showArrow={false}
      >
        {/* @ts-ignore */}
        <div ref={dragHandleElement} className="drag-handle" />
      </Popover>
    </>
  );
};

function absoluteRect(node: Element) {
  const data = node.getBoundingClientRect();
  const modal = node.closest('[role="dialog"]');

  if (modal && window.getComputedStyle(modal).transform !== 'none') {
    const modalRect = modal.getBoundingClientRect();

    return {
      top: data.top - modalRect.top,
      left: data.left - modalRect.left,
      width: data.width,
    };
  }
  return {
    top: data.top,
    left: data.left,
    width: data.width,
  };
}

function nodeDOMAtCoords(coords: { x: number; y: number }) {
  return document
    .elementsFromPoint(coords.x, coords.y)
    .find(
      (elem: Element) =>
        elem.parentElement?.matches?.('.ProseMirror') ||
        elem.matches(
          [
            'li',
            'p:not(:first-child)',
            'pre',
            'blockquote',
            'h1, h2, h3, h4, h5, h6',
          ].join(', ')
        )
    );
}

function nodePosAtDOM(
  node: Element,
  view: EditorView,
  options: GlobalDragHandleOptions
) {
  const boundingRect = node.getBoundingClientRect();

  return view.posAtCoords({
    left: boundingRect.left + 50 + options.dragHandleWidth,
    top: boundingRect.top + 1,
  })?.inside;
}

function calcNodePos(pos: number, view: EditorView) {
  const $pos = view.state.doc.resolve(pos);
  if ($pos.depth > 1) return $pos.before($pos.depth);
  return pos;
}
