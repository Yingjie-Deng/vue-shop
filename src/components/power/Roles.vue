<template>
  <div>
    <!--  面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showaddRole">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="rolelist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级权限 -->
              <el-col :span="19">
                <!-- 通过 for 循环 嵌套渲染二级权限 -->
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="索引"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="modifyRights(scope.row.id)"
            >编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="delRule(scope.row.id)">删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisible"
      width="50%"
      @close="addRuleDialogClosed"
    >
      <el-form
        :model="addRuleForm"
        :rules="addRuleFromRules"
        ref="addRuleFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRuleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRuleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色对话框 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="modifyRoleDialogVisible"
      width="50%"
      @close="modifyRuleDialogClosed"
    >
      <el-form
        :model="modifyRuleForm"
        :rules="addRuleFromRules"
        ref="modifyRuleFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="modifyRuleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="modifyRuleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="modifyRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="modifyRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import RightsVue from './Rights.vue';
export default {
  data() {
    return {
      // 所有角色列表数据
      rolelist: [],
      // 控制修改权限对话框的显示与隐藏
      setRightDialogVisible: false,
      // 所有权限的数据
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children',
      },
      // 默认选中的节点ID值数组
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: '',
      // 控制添加角色对话框的显示与隐藏
      addRoleDialogVisible: false,
      // 待添加角色的临时数据
      addRuleForm: {
        roleName: '',
        roleDesc: '',
      },
      // 待添加角色验证规则对象
      // 待修改角色共用
      addRuleFromRules: {
        roleName: [
          { required: true, message: '请输入角色名！', trigger: 'blur' },
        ],
      },
      // 控制 编辑角色 对话框的显示与隐藏
      modifyRoleDialogVisible: false,
      // 保存 编辑角色 时的临时数据
      modifyRuleForm: {
        roleId: '',
        roleName: '',
        roleDesc: '',
      },
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    // 获取所有角色的列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles');
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！');
      }
      this.rolelist = res.data;
      console.log(this.rolelist);
    },
    // 根据id删除对应的权限
    async removeRightById(role, rightId) {
      // 弹框提示是否要删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除该权限，是否继续？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err);
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除！');
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败！');
      }
      // this.getRolesList();
      role.children = res.data;
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      this.roleId = role.id;
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree');
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败！');
      }
      // 获取到的权限数据保存到 data 中
      this.rightsList = res.data;
      console.log(this.rightsList);
      // 递归获取三级节点的id
      this.getLeafKeys(role, this.defKeys);
      this.setRightDialogVisible = true;
    },
    // 通过递归的形式，获取角色下所有三级权限的id，并保存到defkeys数组中
    getLeafKeys(node, arr) {
      // 如果当前 node 节点不包含children 属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach((item) => this.getLeafKeys(item, arr));
    },
    // 监听分配权限对话框的关闭事件
    // 法二：打开对话框的时候就先初始化，再递归查询
    // 即，在showSetRightDialog(role)调用里面，this.getLeafKeys(role, this.defKeys);
    // 的前面对数组defKeys进行初始化
    setRightDialogClosed() {
      this.defKeys = [];
    },
    // 点击为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ];
      const idStr = keys.join(',');
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      );
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败！');
      }
      this.$message.success('分配权限成功！');
      this.getRolesList();
      this.setRightDialogVisible = false;
    },
    // 点击按钮，展示添加角色对话框
    showaddRole() {
      this.addRoleDialogVisible = true;
    },
    // 点击按钮，添加角色
    addRole() {
      this.$refs.addRuleFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message({ type: 'error', message: '请输入角色名！' });
        }
        const { data: res } = await this.$http.post('roles', this.addRuleForm);
        if (res.meta.status !== 201) {
          return this.$message({ type: 'error', message: '添加角色失败！' });
        }
        this.getRolesList();
        this.$message({ type: 'success', message: '添加角色成功！' });
        this.addRoleDialogVisible = false;
      });
    },
    // 监听 添加角色 对话框的关闭事件
    addRuleDialogClosed() {
      this.$refs.addRuleFormRef.resetFields();
    },
    // 点击按钮，显示修改角色对话框
    modifyRights(id) {
      this.modifyRuleForm.roleId = id;
      this.modifyRoleDialogVisible = true;
    },
    // 监听 编辑角色对话框 的关闭事件
    modifyRuleDialogClosed() {
      this.$refs.modifyRuleFormRef.resetFields();
      this.modifyRuleForm.roleId = '';
    },
    // 点击按钮，提交角色修改
    modifyRole() {
      this.$refs.modifyRuleFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message({ type: 'error', message: '请输入角色名称！' });
        }
        const { data: res } = await this.$http.put(
          'roles/' + this.modifyRuleForm.roleId,
          {
            roleName: this.modifyRuleForm.roleName,
            roleDesc: this.modifyRuleForm.roleDesc,
          }
        );
        if (res.meta.status !== 200) {
          return this.$message({ type: 'error', message: '修改角色失败！' });
        }
        this.getRolesList();
        this.$message({ type: 'success', message: '角色修改成功！' });
        this.modifyRoleDialogVisible = false;
      });
    },
    // 删除角色
    async delRule(id) {
      const confirmRet = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err);
        if (confirmRet !== 'confirm') {
          return this.$message({type: 'info', message: '已取消删除！'});
        }
        const {data: res} = await this.$http.delete('roles/' + id);
        if (res.meta.status !== 200) {
          return this.$messge({type: 'error', message: '删除角色失败！'});
        }
        this.getRolesList();
        this.$message({type: 'success', message: '删除角色成功！'});
    }
  },
};
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>