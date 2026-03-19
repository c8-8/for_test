import pandas as pd

# 1. 讀取檔案 (加入 encoding 預防萬一)
file_name = '醫務管理概論.xlsx - 工作表1.csv'
df = pd.read_csv(file_name, encoding='utf-8-sig')

# 2. 建立產出的檔案
with open('1.ts', 'w', encoding='utf-8') as f:
    f.write("export interface Question { id: number; question: string; options: { A: string; B: string; C: string; D: string; }; answer: string; }\n\n")
    f.write("export const medicalManagementQuestions: Question[] = [\n")
    
    # 3. 用位置 (iloc) 抓資料：0是ID, 1是題目, 2-5是選項, 6是答案
    for i in range(len(df)):
        row = df.iloc[i]
        try:
            q_id = int(row[0])
            q_text = str(row[1]).replace('"', '\\"').replace('\n', ' ')
            oa = str(row[2]).replace('"', '\\"').replace('\n', ' ')
            ob = str(row[3]).replace('"', '\\"').replace('\n', ' ')
            oc = str(row[4]).replace('"', '\\"').replace('\n', ' ')
            od = str(row[5]).replace('"', '\\"').replace('\n', ' ')
            ans = str(row[6]).strip().upper()
            
            line = f'  {{ id: {q_id}, question: "{q_text}", options: {{ A: "{oa}", B: "{ob}", C: "{oc}", D: "{od}" }}, answer: "{ans}" }},\n'
            f.write(line)
        except:
            continue
            
    f.write("];")

print("✨ 終於搞定了！友柔，快去左邊看 1.ts！")