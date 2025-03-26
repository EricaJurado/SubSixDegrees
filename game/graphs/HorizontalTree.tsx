import { useEffect, useCallback, useRef } from 'react';
import * as d3 from 'd3';
import { Node } from '../shared';

interface HorizontalTreeProps {
  data: Node;
}

const width = 900;
const height = 500;
const margin = { top: 10, right: 10, bottom: 10, left: 10 };

let svg: any = null;
let tree: any = null;

const HorizontalTree = ({ data }: HorizontalTreeProps) => {
  const ref = useRef<SVGSVGElement | null>(null);

  const drawTree = (treeData: any) => {
    const nodes = tree(buildNodesHierarchy(treeData));
    svg = buildSvgContainer(width, height);
    const group = buildGroup();
    buildLinksBetweenNodes(group, nodes);
    buildNode(group, nodes);
  };

  const initSvg = useCallback(() => {
    tree = buildTreeMap(width, height);

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
  }, [drawTree, data]);

  useEffect(() => {
    initSvg();
  }, [initSvg]);

  const resetAllCircleStyle = () => {
    d3.selectAll('circle').transition().style('stroke', '#004cae');
  };

  const handleClickOnEntity = (event: MouseEvent, d: any) => {
    console.log('Node clicked:', d);

    resetAllCircleStyle();
    const target = event.target as SVGElement;
    d3.select(target)
      .transition()
      .style('stroke', '#c41704') // change the stroke color
      .style('fill', '#c41704') // change the fill color
      .attr('r', 5 * 1.2) // temp inc radius
      .transition()
      .attr('r', 5); // reset the radius
  };

  const buildSvgContainer = (width: number, height: number) => {
    return d3
      .select(ref.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);
  };

  const buildGroup = () => {
    return svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  };

  const buildTreeMap = (width: number, height: number) => {
    return d3.tree().size([height, width]);
  };

  const buildNodesHierarchy = (nodes: any): any => {
    return d3.hierarchy(nodes, (d: any) => {
      if (d && d.children) {
        return d.children;
      }
    });
  };

  const buildLinksBetweenNodes = (group: any, nodes: any) => {
    return group
      .selectAll('.link')
      .data(nodes.descendants().slice(1))
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', function (d: any) {
        return (
          'M' +
          d.y +
          ',' +
          d.x +
          'C' +
          (d.y + d.parent.y) / 2 +
          ',' +
          d.x +
          ' ' +
          (d.y + d.parent.y) / 2 +
          ',' +
          d.parent.x +
          ' ' +
          d.parent.y +
          ',' +
          d.parent.x
        );
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
      .on('click', function (event: MouseEvent, d: any) {
        handleClickOnEntity(event, d);
      });

    node
      .append('text')
      .attr('dy', '.25em')
      .attr('x', (d: any) => (d.children ? -13 : 13))
      .style('text-anchor', (d: any) => (d.children ? 'end' : 'start'))
      .text((d: any) => d.data.name);
  };

  return <svg ref={ref} />;
};

export default HorizontalTree;
