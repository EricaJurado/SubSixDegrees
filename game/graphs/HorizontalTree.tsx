import { useEffect, useCallback, useRef } from 'react';
import * as d3 from 'd3';
import { Node } from '../shared';

interface HorizontalTreeProps {
  data: Node;
  handleNodeClick: (node: Node) => void;
  currentNode?: Node | null;
  snoovatarUrl?: string;
  prepImageForComment?: boolean;
  ref: any; // Use ref prop passed from parent
}

const margin = { top: 40, right: 100, bottom: 40, left: 100 };

let svg: any = null;
let tree: any = null;

const HorizontalTree = ({
  data,
  handleNodeClick,
  currentNode,
  snoovatarUrl,
  prepImageForComment,
  ref,
}: HorizontalTreeProps) => {
  const drawTree = (treeData: any) => {
    const nodes = tree(buildNodesHierarchy(treeData));
    svg = buildSvgContainer();
    const group = buildGroup();
    buildLinksBetweenNodes(group, nodes);
    buildNode(group, nodes);
  };

  const initSvg = useCallback(() => {
    tree = buildTreeMap();

    // clear prev SVG els before drawing a new one
    d3.select(ref.current).selectAll('*').remove();

    drawTree(data);
  }, [drawTree, data, ref]);

  useEffect(() => {
    initSvg();
  }, [initSvg]);

  const tooltip = d3
    .select('body')
    .append('div')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background', 'black')
    .style('color', 'white')
    .style('padding', '5px 10px')
    .style('border-radius', '5px')
    .style('font-size', '12px')
    .style('pointer-events', 'none'); // Prevents tooltip from interfering with mouse events

  const showTooltip = (event: MouseEvent, d: any) => {
    tooltip
      .style('visibility', 'visible')
      .text(
        d.data.type === 'user'
          ? 'u/' + d.data.name
          : d.data.type === 'subreddit'
            ? 'r/' + d.data.name
            : d.data.name
      );
  };

  const moveTooltip = (event: MouseEvent) => {
    const [x, y] = d3.pointer(event, document.body);
    tooltip.style('top', `${y + 10}px`).style('left', `${x + 10}px`);
  };

  const hideTooltip = () => {
    tooltip.style('visibility', 'hidden');
  };

  const handleClickOnEntity = (event: MouseEvent, d: any) => {
    console.log('Node clicked:', d);
    handleNodeClick(d.data);
    const target = event.target as SVGElement;
    d3.select(target)
      .transition()
      .attr('r', 5 * 1.2) // temp inc radius
      .transition()
      .attr('r', 5); // reset the radius
  };

  const buildSvgContainer = () => {
    const container = ref.current?.parentElement;
    if (!container) return;

    const { width, height } = container.getBoundingClientRect();
    return d3
      .select(ref.current)
      .attr(
        'viewBox',
        `-${margin.left} -${margin.top} ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`
      )
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .style('background-color', 'white');
  };

  const buildGroup = () => {
    return svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  };

  const buildTreeMap = () => {
    const container = ref.current?.parentElement;
    if (!container) return;

    const { width, height } = container.getBoundingClientRect();
    return d3
      .tree()
      .size([
        height ? height - margin.top - margin.bottom : 500,
        width ? width - margin.left - margin.right : 400,
      ]);
  };

  const buildNodesHierarchy = (nodes: any): any => {
    return d3.hierarchy(nodes, (d: any) => d.children);
  };

  const buildLinksBetweenNodes = (group: any, nodes: any) => {
    return group
      .selectAll('.link')
      .data(nodes.descendants().slice(1))
      .enter()
      .append('path')
      .style('stroke', '#004cae')
      .style('stroke-width', 2)
      .attr('class', 'link')
      .attr('d', function (d: any) {
        return `M${d.y},${d.x} L${d.parent.y},${d.parent.x}`;
      });
  };

  const buildNode = (group: any, nodes: any) => {
    let node = group
      .selectAll('.node')
      .data(nodes.descendants())
      .enter()
      .append('g')
      .attr('class', (d: any) => 'node' + (d.children ? ' node--internal' : ' node--leaf'))
      .attr('transform', (d: any) => 'translate(' + d.y + ',' + d.x + ')');

    node.each((d: any, i: number, nodes: SVGGElement[]) => {
      const currentElement = d3.select(nodes[i]);

      if (currentNode && d.data.id === currentNode.id && snoovatarUrl) {
        currentElement
          .append('image')
          .attr(
            'xlink:href',
            prepImageForComment && snoovatarUrl ? snoovatarUrl : 'defaultSnoo.png'
          )
          .attr('width', 40)
          .attr('height', 40)
          .attr('x', -20) // Centering the image
          .attr('y', -20) // Centering the image
          .attr('clip-path', 'circle(20px at center)')
          .on('mouseover', showTooltip) // Ensure tooltips work for images too
          .on('mousemove', moveTooltip)
          .on('mouseout', hideTooltip);
      } else {
        // Otherwise, use a circle
        currentElement
          .append('circle')
          .attr('r', 5)
          .attr('fill', d.data?.isLeafDuplicate ? 'black' : 'green')
          .on('click', handleClickOnEntity)
          .on('mouseover', showTooltip) // Ensure tooltips work for circles too
          .on('mousemove', moveTooltip)
          .on('mouseout', hideTooltip);
      }
    });

    node
      .append('text')
      .attr('dy', '.25em')
      .attr('x', (d: any) => (d.children ? -13 : 13))
      .style('text-anchor', (d: any) => (d.children ? 'end' : 'start'))
      .text((d: any) => {
        let displayName = d.data.name;
        if (d.data.type === 'user') {
          displayName = 'u/' + d.data.name;
        } else if (d.data.type === 'subreddit') {
          displayName = 'r/' + d.data.name;
        }
        return displayName.length > 10 ? displayName.slice(0, 10) + '...' : displayName;
      })
      .on('mouseover', showTooltip) // Ensure tooltips work for text too
      .on('mousemove', moveTooltip)
      .on('mouseout', hideTooltip);
  };

  return <svg ref={ref} />;
};

export default HorizontalTree;
