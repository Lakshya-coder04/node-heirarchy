<script setup>
import { onMounted, ref } from 'vue';
import * as d3 from 'd3';
import '../index.css';

const nodeContainer = ref(null);

// Collapse helper
function collapse(node) {
    if (node.children) {
        node._children = node.children;
        node._children.forEach(collapse);
        node.children = null;
    }
}

function getInitials(name) {
    if (!name) return "??";
    return name.split(' ')
        .map(part => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
}

// Recursive cost calculator
function enrichNodeWithCosts(node) {
    let salary = parseFloat(node.data.data.Salary || 0);

    let managerCost = 0;
    let icCost = 0;
    let managerCount = 0;
    let icCount = 0;

    if (node.children?.length) {
        for (const child of node.children) {
            const result = enrichNodeWithCosts(child);
            managerCost += result.managerCost;
            icCost += result.icCost;
            managerCount += result.managerCount;
            icCount += result.icCount;
        }
        managerCost += salary;
        managerCount += 1;
    } else {
        icCost += salary;
        icCount += 1;
    }

    node.data.calculated = {
        managerCost,
        icCost,
        totalCost: managerCost + icCost,
        managerCount,
        icCount,
        managerCostRatio: (managerCost / (managerCost + icCost)) || 0,
        managerICRatio: managerCount > 0 ? (icCount / managerCount) : 0
    };

    return node.data.calculated;
}

// Render the collapsible tree
function renderHierarchy(root, container) {
    const width = window.innerWidth + 100;
    const height = window.innerHeight + 100;

    d3.select(container.value).selectAll('*').remove();

    const treeContainer = d3.select(container.value)
        .append('div')
        .style('position', 'relative')
        .style('width', `${width}px`)
        .style('height', `${height}px`);

    const svg = treeContainer
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('position', 'absolute')
        .style('top', '0')
        .style('left', '0')
        .style('z-index', '1');

    const treeLayout = d3.tree().size([width - 150, height - 300]);
    treeLayout(root);

    //draw lines

    svg.selectAll('path.link')
        .data(root.links())
        .join('path')
        .attr('class', 'link')
        .attr('fill', 'none')
        .attr('stroke', '#ccc')
        .attr('stroke-width', 2)
        .attr('d', d3.linkVertical()
            .x(d => d.x + 100)
            .y(d => d.y + 180)
        );

    const nodes = treeContainer.selectAll('div.node')
        .data(root.descendants())
        .join('div')
        .attr('class', d => `node ${d._children ? 'has-children' : ''}`)
        .style('position', 'absolute')
        .style('left', d => `${d.x - 75 + 50}px`)
        .style('top', d => `${d.y - 40 + 50}px`)
        .style('z-index', '2')
        .style('cursor', 'pointer')
        .on('click', (event, d) => {
            event.stopPropagation();
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else if (d._children) {
                d.children = d._children;
                d._children = null;
            }
            renderHierarchy(root, container);
        });

    nodes.each(function (d) {
        const node = d3.select(this);
        const card = node.append('div')
            .attr('class', 'relative flex flex-col grow-0 shrink-0 basis-[160px] gap-2 justify-center items-center rounded-2xl p-4 m-auto mt-10 shadow-2xl bg-purple-300');

        const c = d.data.calculated || {};
        const formatAmount = (val) => {
            if (!val || isNaN(val)) return "$0";
            if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(2)}B / year`;
            if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M / year`;
            if (val >= 1_000) return `$${(val / 1_000).toFixed(2)}K / year`;
            return `$${val.toFixed(2)} / year`;
        };

        // Helper for info rows
        const label = (title, value) => {
            return card.append('div')
                .attr('class', 'px-2 py-1 rounded-full bg-white/70 text-xs text-gray-700 font-semibold shadow-sm w-full text-center mt-1')
                .text(`${title}: ${value}`);
        };

        // Card info
        card.append('div')
            .attr('class', 'font-semibold absolute transform top-0 translate-x-[0%] translate-y-[-50%] p-2 bg-blue-500 text-[#f2f2f2] text-[24px] rounded-full ').text(getInitials(d.data.data.Name) || 'Unknown');


        card.append('h1')
            .attr('class', 'font-bold text-xl text-gray-800 mt-5')
            .text(d.data.data.Name || 'Unknown');

        card.append('div')
            .attr('class', 'text-md text-gray-600')
            .text(`${d.data.data['Job Title'] || 'N/A'}`);

        card.append('div')
            .attr('class', 'px-2 py-1 rounded-full bg-white/70 text-xs text-gray-700 font-semibold shadow-sm w-full text-center mt-1')
            .text(`${d.data.data['Department']}`);

        card.append('div')
            .attr('class', 'px-2 py-1 rounded-full bg-white/70 text-xs text-gray-700 font-semibold shadow-sm w-full text-center mt-1')
            .text(`${d.data.data['Location'] || 'None'}`);

        // Enriched metrics

        label("Layer", `${d.data.data['level']}`);
        label("Reporting layers", `${d.height}`);
        label("Manager count", c.managerCount ?? 0);
        label("Manager cost", `${formatAmount(c.managerCost)}`);
        label("IC cost", `${formatAmount(c.icCost)}`);
        label("Manager cost ratio", c.managerCostRatio?.toFixed(2) ?? "0.00");
        label("Manager IC Ratio", c.managerICRatio?.toFixed(2) ?? "0.00");

        const totalDescendants = d.descendants().length - 1; // exclude self
        const directDescendants = (d.children || d._children || []).length;

        card.append('div')
            .attr('class', 'text-sm p-2 rounded-2xl bg-black text-[#fff] font-medium mt-1 transition-transform duration-300')
            .text(`${totalDescendants} / ${directDescendants} ${d.children ? '▲' : '▼'}`);
    });
}

// Mount & load CSV
onMounted(async () => {
    const data = await d3.csv('/people-1.csv');

    const stratify = d3.stratify()
        .id(d => d['Employee Id'])
        .parentId(d => d['Manager']);

    const stratified = stratify(data);
    const root = d3.hierarchy(stratified);

    enrichNodeWithCosts(root);

    root.children?.forEach(collapse);
    renderHierarchy(root, nodeContainer);

    window.addEventListener('resize', () => {
        renderHierarchy(root, nodeContainer);
    });
});
</script>

<template>
    <div class="bg-white flex justify-center items-center min-h-screen overflow-auto p-4">
        <div ref="nodeContainer" class="w-full h-full "></div>
    </div>
</template>

<style scoped>
.link {
    stroke: #94a3b8;
    stroke-opacity: 0.6;
}
</style>