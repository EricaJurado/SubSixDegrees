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
    d3.select(ref.current).on('click', function (event: MouseEvent) {
      const outside = d3
        .select(ref.current)
        .selectAll('*')
        .filter((d: any, i: number, nodes: any) => nodes[i] === event.target) // Use native event
        .empty();
      if (outside) {
        resetAllCircleStyle();
      }
    });
  }, [drawTree, data, ref]);

  useEffect(() => {
    initSvg();
  }, [initSvg]);

  const resetAllCircleStyle = () => {
    d3.selectAll('circle').transition().style('stroke', '#004cae');
  };

  const handleClickOnEntity = (event: MouseEvent, d: any) => {
    console.log('Node clicked:', d);
    handleNodeClick(d.data);
    const target = event.target as SVGElement;
    d3.select(target)
      .transition()
      .style('stroke', '#c41704') // change the stroke color
      .style('fill', '#c41704') // change the fill color
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

    node
      .append('circle')
      .attr('r', 5)
      .attr('fill', (d: any) => {
        if (currentNode && d.data.id === currentNode.id) {
          return 'red';
        }
        return d.data?.isLeafDuplicate ? 'black' : 'green';
      })
      .on('click', function (event: MouseEvent, d: any) {
        handleClickOnEntity(event, d);
      });

    // Add either a circle or an image (snoovatar)
    node.each((d: any, i: number, nodes: SVGGElement[]) => {
      const currentElement = d3.select(nodes[i]); // Explicitly reference the current node

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
          .attr('clip-path', 'circle(20px at center)');
      } else {
        currentElement
          .append('circle')
          .attr('r', 5)
          .attr('fill', (d: any) => {
            if (currentNode && d.data.id === currentNode.id) {
              return 'red';
            }
            return d.data?.isLeafDuplicate ? 'black' : 'green';
          })
          .on('click', function (event: MouseEvent, d: any) {
            handleClickOnEntity(event, d);
          });
      }
    });

    node
      .append('text')
      .attr('dy', '.25em')
      .attr('x', (d: any) => (d.children ? -13 : 13))
      .style('text-anchor', (d: any) => (d.children ? 'end' : 'start'))
      .text((d: any) => {
        if (d.data.type === 'user') {
          return 'u/' + d.data.name;
        } else if (d.data.type === 'subreddit') {
          return 'r/' + d.data.name;
        }
        return d.data.name;
      });
  };

  return <svg ref={ref} />;
};

export default HorizontalTree;
