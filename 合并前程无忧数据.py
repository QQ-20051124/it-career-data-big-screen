import pandas as pd
import os

def merge_csv_files():
    # 定义文件路径
    beijing_file = r'c:\Users\Vicky\Desktop\IT学习与就业数据可视化导航系统\前程无忧 北京\it_jobs_北京.csv'
    shanghai_file = r'c:\Users\Vicky\Desktop\IT学习与就业数据可视化导航系统\前程无忧 上海\it_jobs_上海.csv'
    output_file = r'c:\Users\Vicky\Desktop\IT学习与就业数据可视化导航系统\前程无忧_北京上海_合并.csv'

    print("=" * 60)
    print("前程无忧数据合并工具")
    print("=" * 60)

    # 读取北京数据
    print(f"\n[1/3] 读取北京数据: {beijing_file}")
    try:
        df_beijing = pd.read_csv(beijing_file, encoding='utf-8-sig')
        print(f"   [OK] 北京数据: {len(df_beijing)} 条")
    except Exception as e:
        print(f"   [FAIL] 读取失败: {e}")
        return

    # 读取上海数据
    print(f"\n[2/3] 读取上海数据: {shanghai_file}")
    try:
        df_shanghai = pd.read_csv(shanghai_file, encoding='utf-8-sig')
        print(f"   [OK] 上海数据: {len(df_shanghai)} 条")
    except Exception as e:
        print(f"   [FAIL] 读取失败: {e}")
        return

    # 合并数据
    print(f"\n[3/3] 合并数据...")
    df_merged = pd.concat([df_beijing, df_shanghai], ignore_index=True)
    print(f"   [OK] 合并后总数: {len(df_merged)} 条")

    # 去重（基于公司、城市、职位）
    print(f"\n[去重处理]")
    initial_count = len(df_merged)
    df_merged = df_merged.drop_duplicates(subset=['公司', '城市', '职位'], keep='first')
    duplicates_removed = initial_count - len(df_merged)
    print(f"   [OK] 删除重复: {duplicates_removed} 条")
    print(f"   [OK] 去重后总数: {len(df_merged)} 条")

    # 保存合并后的数据
    print(f"\n[保存数据]")
    df_merged.to_csv(output_file, index=False, encoding='utf-8-sig')
    print(f"   [OK] 已保存到: {output_file}")

    print("\n" + "=" * 60)
    print("合并完成！")
    print("=" * 60)
    print(f"\n[统计信息]")
    print(f"   北京: {len(df_beijing)} 条")
    print(f"   上海: {len(df_shanghai)} 条")
    print(f"   合并: {len(df_merged)} 条")
    print(f"   删除重复: {duplicates_removed} 条")
    print(f"\n[输出文件] {output_file}")

if __name__ == '__main__':
    merge_csv_files()