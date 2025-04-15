<script setup>
import { ref } from 'vue';
import Papa from 'papaparse';
import Card from './Card.vue';


class Employee {
    constructor(record) {
        this.id = record['Employee Id'];
        this.name = record['Name'];
        this.jobTitle = record['Job Title'];
        this.email = record['Email'];
        this.managerId = record['Manager'];
        this.status = record['Status'];
        this.startDate = record['Start Date'];
        this.endDate = record['End Date'];
        this.department = record['Department'];
        this.location = record['Location'];
        this.salary = parseFloat(record['Salary']) || 0;
        this.bonus = parseFloat(record['Bonus']) || 0;
        this.photo = record['Photo'];
        this.performance = record['Performance'];
        this.project = record['Project'];
        this.entity = record['Entity'];
        this.recruiting = record['Recruiting'];
        this.skill = record['Skill'];
        this.role = record['Role'];
        this.utilization = record['Utilization'];
        this.source = record['Source'];
        this.level = record['level'];
        this.children = [];
        this.descendants = null;
        this.expanded = false;
        this.totalCost = 0;
        this.icCost = 0;
        this.managementCost = 0;
        this.icCount = 0;
        this.managerCount = 0;
        this.managementCostRatio = 0;
        this.managerToIcRatio = 0;

    }
}
function calculateCosts(emp) {
    if (emp._costsCalculated) return;

    let totalCost = 0;
    let icCost = 0;
    let managementCost = 0;
    let icCount = 0;
    let managerCount = 0;

    for (const child of emp.children) {
        calculateCosts(child); // recurse with memo
        totalCost += child.salary + child.totalCost;

        if (child.children.length > 0) {
            managementCost += child.salary;
            managerCount += 1;
        } else {
            icCost += child.salary;
            icCount += 1;
        }

        icCost += child.icCost;
        managementCost += child.managementCost;
        icCount += child.icCount;
        managerCount += child.managerCount;
    }

    emp.totalCost = totalCost;
    emp.icCost = icCost;
    emp.managementCost = managementCost;
    emp.icCount = icCount;
    emp.managerCount = managerCount;
    emp.managementCostRatio = managementCost === 0 ? 0 : icCost / managementCost;
    emp.managerToIcRatio = managerCount === 0 ? 0 : icCount / managerCount;
    emp._costsCalculated = true;
}

function processBatch(rows, allEmployees, idMap) {
    const employees = rows.map(row => new Employee(row));
    employees.forEach(emp => {
        allEmployees.push(emp);
        idMap.set(emp.id, emp);
    });
}

function buildHierarchy(employees, idMap) {
    const roots = [];

    employees.forEach(emp => {
        if (idMap.has(emp.managerId)) {
            const manager = idMap.get(emp.managerId);
            manager.children.push(emp);
        } else {
            roots.push(emp);
        }
    });

    return roots;
}


function countDescendants(emp) {
    if (emp.descendants !== null) return emp.descendants;

    if (!emp.children || emp.children.length === 0) {
        emp.descendants = 0;
        return 0;
    }

    emp.descendants = emp.children.reduce((sum, child) => {
        return sum + 1 + countDescendants(child);
    }, 0);

    return emp.descendants;
}

const data = ref([]);
const BATCH_SIZE = 2000;

function loadCSV() {
    let buffer = [];
    const idMap = new Map();
    const allEmployees = [];

    Papa.parse('/people-1.csv', {
        download: true,
        header: true,
        skipEmptyLines: true,
        step: (row) => {
            buffer.push(row.data);
            if (buffer.length >= BATCH_SIZE) {
                processBatch(buffer, allEmployees, idMap);
                buffer = [];
            }
        },
        complete: () => {
            if (buffer.length > 0) {
                processBatch(buffer, allEmployees, idMap);
            }

            const tree = buildHierarchy(allEmployees, idMap);
            tree.forEach(root => {
                countDescendants(root);
                calculateCosts(root);
            });
            data.value = tree;
        },
        error: (err) => {
            console.error('PapaParse error:', err);
        }
    });
}

loadCSV();
</script>

<template>
    <div class="m-4 p-4">
        <Card v-for="node in data" :key="node.id" :node="node" />
    </div>
</template>
