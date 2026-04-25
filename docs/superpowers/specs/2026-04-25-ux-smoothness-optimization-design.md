# 用户体验与流畅度优化设计文档

**日期：** 2026-04-25
**范围：** 搜索防抖、路由过渡、骨架屏、数字动画

## 概述

对秋招投递管理系统进行四项用户体验优化，提升首屏感知、页面切换流畅度和数据展示生动性。全部使用 Vue 3 原生 API 实现，不引入新依赖。

## 1. 搜索防抖

### 问题
`ApplicationList.vue` 和 `AlgorithmList.vue` 的搜索输入框在每次按键时都触发 `fetchData()`，导致：
- 大量不必要的 localStorage 读取
- 快速输入时页面卡顿感
- 输入反馈延迟

### 方案
- 新增 `searchInput` ref 存储实时输入值
- 新增 `debounceSearch` ref 存储 300ms 后的搜索关键词
- `watch(searchInput)` 内清除旧定时器，300ms 后同步到 `debounceSearch` 并触发查询
- 将模板中 `v-model="searchForm.companyName"` 改为 `v-model="searchInput"`
- 过滤逻辑使用 `debounceSearch` 而非 `searchForm.companyName`

### 涉及文件
- `src/views/ApplicationList.vue` — 公司名搜索
- `src/views/AlgorithmList.vue` — 题目名搜索

## 2. 路由过渡动画

### 问题
`App.vue` 的 `<keep-alive>` 外层无 `<transition>` 包裹，页面切换是瞬切，没有视觉过渡。`transitions.css` 已定义好 `fade-scale` 动画但未使用。

### 方案
```vue
<router-view v-slot="{ Component }">
  <transition name="fade-scale" mode="out-in">
    <keep-alive>
      <component :is="Component" :key="$route.path" />
    </keep-alive>
  </transition>
</router-view>
```

- 动画：350ms ease-spring 进入（从 scale 0.96 + translateY 8px），200ms 退出
- `mode="out-in"` 确保旧页面先退出再进入新页面
- `:key="$route.path"` 确保 keep-alive 按路由正确缓存

### 涉及文件
- `src/App.vue` — 模板部分

## 3. 骨架屏加载

### 问题
所有列表页和 Dashboard 首次加载时只显示 `v-loading` 旋转图标，用户看到的是空白区域。骨架屏能减少感知等待时间。

### 方案
每个页面新增 `dataLoaded = ref(false)`：
- 数据首次加载完成后设为 `true`
- `!dataLoaded` 时显示 `el-skeleton` 骨架屏
- `dataLoaded && loading` 时显示表格内置 loading

### 各页面骨架屏布局

**Dashboard：** 4 个卡片骨架 + 图表区域骨架
**ApplicationList：** 搜索表单骨架 + 10 行表格骨架
**AlgorithmList：** 统计面板骨架 + 10 行表格骨架
**BaguList / InterviewRecords：** 类似列表结构

### 涉及文件
- `src/views/Dashboard.vue`
- `src/views/ApplicationList.vue`
- `src/views/AlgorithmList.vue`
- `src/views/BaguList.vue`
- `src/views/InterviewRecords.vue`

## 4. 统计数字动画 + 图表渐显

### 问题
Dashboard 的统计数字直接显示，图表瞬间出现，缺少生命力。

### 方案

**数字 count-up 动画：**
- 在 Dashboard 中定义 `useCountUp` 函数（不单独抽 composable，减少文件）
- 接受 target 值和 duration，使用 easeOutExpo 缓动曲线
- 返回 `value` ref 和 `animate` 方法
- 数据加载完成后触发 animate()，4 个数字 stagger 延迟 80ms 启动

**图表渐显：**
- `renderPieChart()` 中设置 `animationDuration: 1000`，`animationEasing: 'cubicOut'`
- ECharts 原生动画能力，无需额外代码

### 涉及文件
- `src/views/Dashboard.vue`

## 架构影响

- 无新依赖引入
- 无 API 变更
- 所有改动均为局部修改，各页面独立
- 不影响 keep-alive 缓存行为（加 key 后缓存仍正常）

## 测试策略

- 手动测试各页面路由切换动画
- 输入搜索关键词观察防抖效果
- 刷新页面观察骨架屏到真实数据的过渡
- Dashboard 数字动画是否正常触发
