<script setup>
import Card from './Card.vue';
import '../index.css';
import { OhVueIcon } from "oh-vue-icons";

const props = defineProps({
    node: Object
});

function toggle() {
    props.node.expanded = !props.node.expanded;
}

function formatCurrency(value) {
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
    if (value >= 1_000) return (value / 1_000).toFixed(1) + 'K';
    return value.toFixed(0);
}

function getInitials(name) {
    if (!name) return '';
    return name
        .split(' ')
        .filter(Boolean)
        .map(word => word[0].toUpperCase())
        .join('')
        .slice(0, 2); // Max 2 letters
}

</script>


<template>
    <div class="flex flex-col items-center border-gray-300">
        <div class="relative w-[220px] flex flex-col items-center p-2 mb-1 rounded-lg shadow hover:bg-gray-100 cursor-pointer bg-purple-200"
            @click="toggle">

            <div
                class="font-semibold absolute transform top-0 translate-x-[0%] translate-y-[-50%] p-2 bg-blue-500 text-[#f2f2f2] text-[24px] rounded-full ">
                {{
                    getInitials(node.name) }}</div>

            <div class="mt-5 flex flex-col items-center space-x-2">
                <div class="font-semibold">{{ node.name }}</div>
                <div class="text-sm text-gray-500">{{ node.jobTitle }}</div>


                <div class="flex flex-col items-center gap-2">
                    <p class=" text-[#f2f2f2] text-[10px] rounded-3xl bg-purple-400 p-1.5 flex items-center">{{
                        node.department
                    }}</p>
                    <p class=" text-[#f2f2f2] text-xs rounded-3xl bg-gray-500 p-1.5 flex items-center">
                        <OhVueIcon name="co-location-pin" /> {{
                            node.location }}
                    </p>

                    <p class=" text-[#f2f2f2] text-xs rounded-3xl bg-gray-500 p-1.5 flex items-center">Level: {{
                        node.level }}</p>
                    <p class=" text-[#f2f2f2] text-xs rounded-3xl bg-gray-500 p-1.5 flex items-center">Manager Count: {{
                        node.managerCount }}</p>
                    <p class=" text-[#f2f2f2] text-xs rounded-3xl bg-gray-500 p-1.5 flex items-center">Manager Cost: $
                        {{
                            formatCurrency(node.managementCost) }} / year</p>
                    <p class=" text-[#f2f2f2] text-xs rounded-3xl bg-gray-500 p-1.5 flex items-center">IC Count:
                        {{
                            node.icCount }}</p>

                    <p class=" text-[#f2f2f2] text-xs rounded-3xl bg-gray-500 p-1.5 flex items-center">IC Cost: $ {{
                        formatCurrency(node.icCost) }} / year
                    </p>


                    <p class=" text-[#f2f2f2] text-xs rounded-3xl bg-gray-500 p-1.5 flex items-center">Manager Cost
                        Ratio: {{
                            node.managementCostRatio.toFixed(2) }}</p>


                    <p class="text-[#f2f2f2] text-xs rounded-3xl bg-gray-500 p-1.5 flex items-center">Manager IC Ratio:
                        {{ node.managerToIcRatio.toFixed(2)
                        }}</p>

                    <div class="text-xs p-1.5 text-[#f2f2f2] bg-black rounded-3xl">
                        <template v-if="node.expanded">
                            {{ node.children.length }} / {{ node.descendants }}

                        </template>
                        <template v-else>
                            {{ node.descendants }}

                        </template>
                    </div>
                </div>



            </div>

        </div>

        <div v-show="node.expanded" class="mt-10 pt-4 flex flex-col gap-5">
            <Card v-for="child in node.children" :key="child.id" :node="child" />
        </div>
    </div>
</template>
