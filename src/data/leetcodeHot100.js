// LeetCode Hot 100 题目数据
// 来源：https://leetcode.cn/studyplan/top-100-liked/

export const leetcodeHot100 = [
  // 哈希
  { leetcodeId: 1, title: '两数之和', titleSlug: 'two-sum', difficulty: 'Easy', tags: ['数组', '哈希表'], category: '哈希' },
  { leetcodeId: 49, title: '字母异位词分组', titleSlug: 'group-anagrams', difficulty: 'Medium', tags: ['数组', '哈希表', '字符串', '排序'], category: '哈希' },
  { leetcodeId: 128, title: '最长连续序列', titleSlug: 'longest-consecutive-sequence', difficulty: 'Medium', tags: ['并查集', '数组', '哈希表'], category: '哈希' },

  // 双指针
  { leetcodeId: 283, title: '移动零', titleSlug: 'move-zeroes', difficulty: 'Easy', tags: ['数组', '双指针'], category: '双指针' },
  { leetcodeId: 11, title: '盛最多水的容器', titleSlug: 'container-with-most-water', difficulty: 'Medium', tags: ['贪心', '数组', '双指针'], category: '双指针' },
  { leetcodeId: 15, title: '三数之和', titleSlug: '3sum', difficulty: 'Medium', tags: ['数组', '双指针', '排序'], category: '双指针' },
  { leetcodeId: 42, title: '接雨水', titleSlug: 'trapping-rain-water', difficulty: 'Hard', tags: ['栈', '数组', '双指针', '动态规划', '单调栈'], category: '双指针' },

  // 滑动窗口
  { leetcodeId: 3, title: '无重复字符的最长子串', titleSlug: 'longest-substring-without-repeating-characters', difficulty: 'Medium', tags: ['哈希表', '字符串', '滑动窗口'], category: '滑动窗口' },
  { leetcodeId: 438, title: '找到字符串中所有字母异位词', titleSlug: 'find-all-anagrams-in-a-string', difficulty: 'Medium', tags: ['数组', '字符串', '滑动窗口'], category: '滑动窗口' },

  // 子串
  { leetcodeId: 560, title: '和为 K 的子数组', titleSlug: 'subarray-sum-equals-k', difficulty: 'Medium', tags: ['数组', '哈希表', '前缀和'], category: '子串' },
  { leetcodeId: 239, title: '滑动窗口最大值', titleSlug: 'sliding-window-maximum', difficulty: 'Hard', tags: ['队列', '数组', '滑动窗口', '单调队列', '堆（优先队列）'], category: '子串' },
  { leetcodeId: 76, title: '最小覆盖子串', titleSlug: 'minimum-window-substring', difficulty: 'Hard', tags: ['哈希表', '字符串', '滑动窗口'], category: '子串' },

  // 普通数组
  { leetcodeId: 53, title: '最大子数组和', titleSlug: 'maximum-subarray', difficulty: 'Medium', tags: ['数组', '分治', '动态规划'], category: '普通数组' },
  { leetcodeId: 56, title: '合并区间', titleSlug: 'merge-intervals', difficulty: 'Medium', tags: ['数组', '排序'], category: '普通数组' },
  { leetcodeId: 189, title: '轮转数组', titleSlug: 'rotate-array', difficulty: 'Medium', tags: ['数组', '数学', '双指针'], category: '普通数组' },
  { leetcodeId: 238, title: '除自身以外数组的乘积', titleSlug: 'product-of-array-except-self', difficulty: 'Medium', tags: ['数组', '前缀和'], category: '普通数组' },
  { leetcodeId: 41, title: '缺失的第一个正数', titleSlug: 'first-missing-positive', difficulty: 'Hard', tags: ['数组', '哈希表'], category: '普通数组' },

  // 矩阵
  { leetcodeId: 73, title: '矩阵置零', titleSlug: 'set-matrix-zeroes', difficulty: 'Medium', tags: ['数组', '哈希表', '矩阵'], category: '矩阵' },
  { leetcodeId: 54, title: '螺旋矩阵', titleSlug: 'spiral-matrix', difficulty: 'Medium', tags: ['数组', '矩阵', '模拟'], category: '矩阵' },
  { leetcodeId: 48, title: '旋转图像', titleSlug: 'rotate-image', difficulty: 'Medium', tags: ['数组', '数学', '矩阵'], category: '矩阵' },
  { leetcodeId: 240, title: '搜索二维矩阵 II', titleSlug: 'search-a-2d-matrix-ii', difficulty: 'Medium', tags: ['数组', '二分查找', '分治', '矩阵'], category: '矩阵' },

  // 链表
  { leetcodeId: 160, title: '相交链表', titleSlug: 'intersection-of-two-linked-lists', difficulty: 'Easy', tags: ['哈希表', '链表', '双指针'], category: '链表' },
  { leetcodeId: 206, title: '反转链表', titleSlug: 'reverse-linked-list', difficulty: 'Easy', tags: ['递归', '链表'], category: '链表' },
  { leetcodeId: 234, title: '回文链表', titleSlug: 'palindrome-linked-list', difficulty: 'Easy', tags: ['栈', '递归', '链表', '双指针'], category: '链表' },
  { leetcodeId: 141, title: '环形链表', titleSlug: 'linked-list-cycle', difficulty: 'Easy', tags: ['哈希表', '链表', '双指针'], category: '链表' },
  { leetcodeId: 142, title: '环形链表 II', titleSlug: 'linked-list-cycle-ii', difficulty: 'Medium', tags: ['哈希表', '链表', '双指针'], category: '链表' },
  { leetcodeId: 21, title: '合并两个有序链表', titleSlug: 'merge-two-sorted-lists', difficulty: 'Easy', tags: ['递归', '链表'], category: '链表' },
  { leetcodeId: 2, title: '两数相加', titleSlug: 'add-two-numbers', difficulty: 'Medium', tags: ['递归', '链表', '数学'], category: '链表' },
  { leetcodeId: 19, title: '删除链表的倒数第 N 个结点', titleSlug: 'remove-nth-node-from-end-of-list', difficulty: 'Medium', tags: ['链表', '双指针'], category: '链表' },
  { leetcodeId: 24, title: '两两交换链表中的节点', titleSlug: 'swap-nodes-in-pairs', difficulty: 'Medium', tags: ['递归', '链表'], category: '链表' },
  { leetcodeId: 25, title: 'K 个一组翻转链表', titleSlug: 'reverse-nodes-in-k-group', difficulty: 'Hard', tags: ['递归', '链表'], category: '链表' },
  { leetcodeId: 138, title: '随机链表的复制', titleSlug: 'copy-list-with-random-pointer', difficulty: 'Medium', tags: ['哈希表', '链表'], category: '链表' },
  { leetcodeId: 148, title: '排序链表', titleSlug: 'sort-list', difficulty: 'Medium', tags: ['链表', '双指针', '分治', '排序', '归并排序'], category: '链表' },
  { leetcodeId: 23, title: '合并 K 个升序链表', titleSlug: 'merge-k-sorted-lists', difficulty: 'Hard', tags: ['链表', '分治', '堆（优先队列）', '归并排序'], category: '链表' },
  { leetcodeId: 146, title: 'LRU 缓存', titleSlug: 'lru-cache', difficulty: 'Medium', tags: ['设计', '哈希表', '链表', '双向链表'], category: '链表' },

  // 二叉树
  { leetcodeId: 94, title: '二叉树的中序遍历', titleSlug: 'binary-tree-inorder-traversal', difficulty: 'Easy', tags: ['栈', '树', '深度优先搜索', '二叉树'], category: '二叉树' },
  { leetcodeId: 104, title: '二叉树的最大深度', titleSlug: 'maximum-depth-of-binary-tree', difficulty: 'Easy', tags: ['树', '深度优先搜索', '广度优先搜索', '二叉树'], category: '二叉树' },
  { leetcodeId: 226, title: '翻转二叉树', titleSlug: 'invert-binary-tree', difficulty: 'Easy', tags: ['树', '深度优先搜索', '广度优先搜索', '二叉树'], category: '二叉树' },
  { leetcodeId: 101, title: '对称二叉树', titleSlug: 'symmetric-tree', difficulty: 'Easy', tags: ['树', '深度优先搜索', '广度优先搜索', '二叉树'], category: '二叉树' },
  { leetcodeId: 543, title: '二叉树的直径', titleSlug: 'diameter-of-binary-tree', difficulty: 'Easy', tags: ['树', '深度优先搜索', '二叉树'], category: '二叉树' },
  { leetcodeId: 102, title: '二叉树的层序遍历', titleSlug: 'binary-tree-level-order-traversal', difficulty: 'Medium', tags: ['树', '广度优先搜索', '二叉树'], category: '二叉树' },
  { leetcodeId: 108, title: '将有序数组转换为二叉搜索树', titleSlug: 'convert-sorted-array-to-binary-search-tree', difficulty: 'Easy', tags: ['树', '二叉搜索树', '数组', '分治', '二叉树'], category: '二叉树' },
  { leetcodeId: 98, title: '验证二叉搜索树', titleSlug: 'validate-binary-search-tree', difficulty: 'Medium', tags: ['树', '深度优先搜索', '二叉搜索树', '二叉树'], category: '二叉树' },
  { leetcodeId: 230, title: '二叉搜索树中第 K 小的元素', titleSlug: 'kth-smallest-element-in-a-bst', difficulty: 'Medium', tags: ['树', '深度优先搜索', '二叉搜索树', '二叉树'], category: '二叉树' },
  { leetcodeId: 199, title: '二叉树的右视图', titleSlug: 'binary-tree-right-side-view', difficulty: 'Medium', tags: ['树', '深度优先搜索', '广度优先搜索', '二叉树'], category: '二叉树' },
  { leetcodeId: 114, title: '二叉树展开为链表', titleSlug: 'flatten-binary-tree-to-linked-list', difficulty: 'Medium', tags: ['栈', '树', '深度优先搜索', '链表', '二叉树'], category: '二叉树' },
  { leetcodeId: 105, title: '从前序与中序遍历序列构造二叉树', titleSlug: 'construct-binary-tree-from-preorder-and-inorder-traversal', difficulty: 'Medium', tags: ['树', '数组', '哈希表', '分治', '二叉树'], category: '二叉树' },
  { leetcodeId: 437, title: '路径总和 III', titleSlug: 'path-sum-iii', difficulty: 'Medium', tags: ['树', '深度优先搜索', '二叉树'], category: '二叉树' },
  { leetcodeId: 236, title: '二叉树的最近公共祖先', titleSlug: 'lowest-common-ancestor-of-a-binary-tree', difficulty: 'Medium', tags: ['树', '深度优先搜索', '二叉树'], category: '二叉树' },
  { leetcodeId: 124, title: '二叉树中的最大路径和', titleSlug: 'binary-tree-maximum-path-sum', difficulty: 'Hard', tags: ['树', '深度优先搜索', '动态规划', '二叉树'], category: '二叉树' },

  // 图论
  { leetcodeId: 200, title: '岛屿数量', titleSlug: 'number-of-islands', difficulty: 'Medium', tags: ['深度优先搜索', '广度优先搜索', '并查集', '数组', '矩阵'], category: '图论' },
  { leetcodeId: 994, title: '腐烂的橘子', titleSlug: 'rotting-oranges', difficulty: 'Medium', tags: ['广度优先搜索', '数组', '矩阵'], category: '图论' },
  { leetcodeId: 207, title: '课程表', titleSlug: 'course-schedule', difficulty: 'Medium', tags: ['深度优先搜索', '广度优先搜索', '图', '拓扑排序'], category: '图论' },
  { leetcodeId: 208, title: '实现 Trie (前缀树)', titleSlug: 'implement-trie-prefix-tree', difficulty: 'Medium', tags: ['设计', '字典树', '哈希表', '字符串'], category: '图论' },

  // 回溯
  { leetcodeId: 17, title: '电话号码的字母组合', titleSlug: 'letter-combinations-of-a-phone-number', difficulty: 'Medium', tags: ['哈希表', '字符串', '回溯'], category: '回溯' },
  { leetcodeId: 22, title: '括号生成', titleSlug: 'generate-parentheses', difficulty: 'Medium', tags: ['字符串', '动态规划', '回溯'], category: '回溯' },
  { leetcodeId: 79, title: '单词搜索', titleSlug: 'word-search', difficulty: 'Medium', tags: ['数组', '回溯', '矩阵'], category: '回溯' },
  { leetcodeId: 46, title: '全排列', titleSlug: 'permutations', difficulty: 'Medium', tags: ['数组', '回溯'], category: '回溯' },
  { leetcodeId: 78, title: '子集', titleSlug: 'subsets', difficulty: 'Medium', tags: ['位运算', '数组', '回溯'], category: '回溯' },
  { leetcodeId: 131, title: '分割回文串', titleSlug: 'palindrome-partitioning', difficulty: 'Medium', tags: ['字符串', '动态规划', '回溯'], category: '回溯' },
  { leetcodeId: 51, title: 'N 皇后', titleSlug: 'n-queens', difficulty: 'Hard', tags: ['数组', '回溯'], category: '回溯' },

  // 二分查找
  { leetcodeId: 35, title: '搜索插入位置', titleSlug: 'search-insert-position', difficulty: 'Easy', tags: ['数组', '二分查找'], category: '二分查找' },
  { leetcodeId: 74, title: '搜索二维矩阵', titleSlug: 'search-a-2d-matrix', difficulty: 'Medium', tags: ['数组', '二分查找', '矩阵'], category: '二分查找' },
  { leetcodeId: 34, title: '在排序数组中查找元素的第一个和最后一个位置', titleSlug: 'find-first-and-last-position-of-element-in-sorted-array', difficulty: 'Medium', tags: ['数组', '二分查找'], category: '二分查找' },
  { leetcodeId: 33, title: '搜索旋转排序数组', titleSlug: 'search-in-rotated-sorted-array', difficulty: 'Medium', tags: ['数组', '二分查找'], category: '二分查找' },
  { leetcodeId: 153, title: '寻找旋转排序数组中的最小值', titleSlug: 'find-minimum-in-rotated-sorted-array', difficulty: 'Medium', tags: ['数组', '二分查找'], category: '二分查找' },
  { leetcodeId: 4, title: '寻找两个正序数组的中位数', titleSlug: 'median-of-two-sorted-arrays', difficulty: 'Hard', tags: ['数组', '二分查找', '分治'], category: '二分查找' },

  // 栈
  { leetcodeId: 20, title: '有效的括号', titleSlug: 'valid-parentheses', difficulty: 'Easy', tags: ['栈', '字符串'], category: '栈' },
  { leetcodeId: 155, title: '最小栈', titleSlug: 'min-stack', difficulty: 'Medium', tags: ['栈', '设计'], category: '栈' },
  { leetcodeId: 394, title: '字符串解码', titleSlug: 'decode-string', difficulty: 'Medium', tags: ['栈', '递归', '字符串'], category: '栈' },
  { leetcodeId: 739, title: '每日温度', titleSlug: 'daily-temperatures', difficulty: 'Medium', tags: ['栈', '数组', '单调栈'], category: '栈' },
  { leetcodeId: 84, title: '柱状图中最大的矩形', titleSlug: 'largest-rectangle-in-histogram', difficulty: 'Hard', tags: ['栈', '数组', '单调栈'], category: '栈' },

  // 堆
  { leetcodeId: 215, title: '数组中的第K个最大元素', titleSlug: 'kth-largest-element-in-an-array', difficulty: 'Medium', tags: ['数组', '分治', '快速选择', '排序', '堆（优先队列）'], category: '堆' },
  { leetcodeId: 347, title: '前 K 个高频元素', titleSlug: 'top-k-frequent-elements', difficulty: 'Medium', tags: ['数组', '哈希表', '分治', '桶排序', '计数', '快速选择', '排序', '堆（优先队列）'], category: '堆' },
  { leetcodeId: 295, title: '数据流的中位数', titleSlug: 'find-median-from-data-stream', difficulty: 'Hard', tags: ['设计', '双指针', '数据流', '排序', '堆（优先队列）'], category: '堆' },

  // 贪心算法
  { leetcodeId: 121, title: '买卖股票的最佳时机', titleSlug: 'best-time-to-buy-and-sell-stock', difficulty: 'Easy', tags: ['数组', '动态规划'], category: '贪心算法' },
  { leetcodeId: 55, title: '跳跃游戏', titleSlug: 'jump-game', difficulty: 'Medium', tags: ['贪心', '数组', '动态规划'], category: '贪心算法' },
  { leetcodeId: 45, title: '跳跃游戏 II', titleSlug: 'jump-game-ii', difficulty: 'Medium', tags: ['贪心', '数组', '动态规划'], category: '贪心算法' },
  { leetcodeId: 763, title: '划分字母区间', titleSlug: 'partition-labels', difficulty: 'Medium', tags: ['贪心', '哈希表', '双指针', '字符串'], category: '贪心算法' },

  // 动态规划
  { leetcodeId: 70, title: '爬楼梯', titleSlug: 'climbing-stairs', difficulty: 'Easy', tags: ['记忆化搜索', '数学', '动态规划'], category: '动态规划' },
  { leetcodeId: 118, title: '杨辉三角', titleSlug: 'pascals-triangle', difficulty: 'Easy', tags: ['数组', '动态规划'], category: '动态规划' },
  { leetcodeId: 198, title: '打家劫舍', titleSlug: 'house-robber', difficulty: 'Medium', tags: ['数组', '动态规划'], category: '动态规划' },
  { leetcodeId: 279, title: '完全平方数', titleSlug: 'perfect-squares', difficulty: 'Medium', tags: ['广度优先搜索', '数学', '动态规划'], category: '动态规划' },
  { leetcodeId: 322, title: '零钱兑换', titleSlug: 'coin-change', difficulty: 'Medium', tags: ['广度优先搜索', '数组', '动态规划'], category: '动态规划' },
  { leetcodeId: 139, title: '单词拆分', titleSlug: 'word-break', difficulty: 'Medium', tags: ['字典树', '记忆化搜索', '哈希表', '字符串', '动态规划'], category: '动态规划' },
  { leetcodeId: 300, title: '最长递增子序列', titleSlug: 'longest-increasing-subsequence', difficulty: 'Medium', tags: ['数组', '二分查找', '动态规划'], category: '动态规划' },
  { leetcodeId: 152, title: '乘积最大子数组', titleSlug: 'maximum-product-subarray', difficulty: 'Medium', tags: ['数组', '动态规划'], category: '动态规划' },
  { leetcodeId: 416, title: '分割等和子集', titleSlug: 'partition-equal-subset-sum', difficulty: 'Medium', tags: ['数组', '动态规划'], category: '动态规划' },
  { leetcodeId: 32, title: '最长有效括号', titleSlug: 'longest-valid-parentheses', difficulty: 'Hard', tags: ['栈', '字符串', '动态规划'], category: '动态规划' },

  // 多维动态规划
  { leetcodeId: 62, title: '不同路径', titleSlug: 'unique-paths', difficulty: 'Medium', tags: ['数学', '动态规划', '组合数学'], category: '多维动态规划' },
  { leetcodeId: 64, title: '最小路径和', titleSlug: 'minimum-path-sum', difficulty: 'Medium', tags: ['数组', '动态规划', '矩阵'], category: '多维动态规划' },
  { leetcodeId: 5, title: '最长回文子串', titleSlug: 'longest-palindromic-substring', difficulty: 'Medium', tags: ['字符串', '动态规划'], category: '多维动态规划' },
  { leetcodeId: 1143, title: '最长公共子序列', titleSlug: 'longest-common-subsequence', difficulty: 'Medium', tags: ['字符串', '动态规划'], category: '多维动态规划' },
  { leetcodeId: 72, title: '编辑距离', titleSlug: 'edit-distance', difficulty: 'Medium', tags: ['字符串', '动态规划'], category: '多维动态规划' },
  { leetcodeId: 647, title: '回文子串', titleSlug: 'palindromic-substrings', difficulty: 'Medium', tags: ['字符串', '动态规划'], category: '多维动态规划' },

  // 技巧
  { leetcodeId: 136, title: '只出现一次的数字', titleSlug: 'single-number', difficulty: 'Easy', tags: ['位运算', '数组'], category: '技巧' },
  { leetcodeId: 169, title: '多数元素', titleSlug: 'majority-element', difficulty: 'Easy', tags: ['数组', '哈希表', '分治', '计数', '排序'], category: '技巧' },
  { leetcodeId: 75, title: '颜色分类', titleSlug: 'sort-colors', difficulty: 'Medium', tags: ['数组', '双指针', '排序'], category: '技巧' },
  { leetcodeId: 31, title: '下一个排列', titleSlug: 'next-permutation', difficulty: 'Medium', tags: ['数组', '双指针'], category: '技巧' },
  { leetcodeId: 287, title: '寻找重复数', titleSlug: 'find-the-duplicate-number', difficulty: 'Medium', tags: ['位运算', '数组', '双指针', '二分查找'], category: '技巧' }
]

// 添加URL
leetcodeHot100.forEach(item => {
  item.url = `https://leetcode.cn/problems/${item.titleSlug}/`
})

export default leetcodeHot100