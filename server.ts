/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { 
  isDbConnected, 
  ensureDefaultProfile,
  getMembersDb,
  saveMemberDb,
  deleteMemberDb,
  getIncomeCategoriesDb,
  saveIncomeCategoryDb,
  deleteIncomeCategoryDb,
  getExpenseCategoriesDb,
  saveExpenseCategoryDb,
  deleteExpenseCategoryDb,
  getIncomesDb,
  saveIncomeDb,
  deleteIncomeDb,
  getExpensesDb,
  saveExpenseDb,
  deleteExpenseDb,
  getBudgetsDb,
  saveBudgetDb,
  getSavingGoalDb,
  saveSavingGoalDb,
  getNotificationsDb,
  addNotificationDb,
  markNotificationAsReadDb,
  clearAllNotificationsDb,
  getAuditLogsDb,
  resetDatabaseDb
} from './src/db/postgres';

dotenv.config();

// Create Gemini Client
let ai: GoogleGenAI | null = null;
const key = process.env.GEMINI_API_KEY;

if (key) {
  try {
    ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log('Gemini AI Client successfully initialized on backend.');
  } catch (err) {
    console.error('Failed to initialize Gemini Client:', err);
  }
} else {
  console.warn('GEMINI_API_KEY was not found in environment variables. Running in rule-based fallback mode.');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', api_key_detected: !!key });
  });

  // API Routes for Supabase database operations
  app.get('/api/db/status', async (req, res) => {
    const connected = await isDbConnected();
    res.json({ connected });
  });

  app.get('/api/db/state', async (req, res) => {
    try {
      const connected = await isDbConnected();
      if (!connected) {
        return res.json({ connected: false });
      }
      
      const [
        members,
        incomeCategories,
        expenseCategories,
        incomes,
        expenses,
        budgets,
        goal,
        notifications,
        auditLogs
      ] = await Promise.all([
        getMembersDb(),
        getIncomeCategoriesDb(),
        getExpenseCategoriesDb(),
        getIncomesDb(),
        getExpensesDb(),
        getBudgetsDb(),
        getSavingGoalDb(),
        getNotificationsDb(),
        getAuditLogsDb()
      ]);

      res.json({
        connected: true,
        members,
        incomeCategories,
        expenseCategories,
        incomes,
        expenses,
        budgets,
        goal,
        notifications,
        auditLogs
      });
    } catch (err: any) {
      console.error('Error fetching backend DB state:', err);
      res.status(500).json({ error: 'Failed to fetch database state', details: err.message });
    }
  });

  // Bulk sync from Local Storage during initial conversion
  app.post('/api/db/sync-full', async (req, res) => {
    try {
      const connected = await isDbConnected();
      if (!connected) return res.status(400).json({ error: 'Database not connected' });

      const { members, incomeCategories, expenseCategories, incomes, expenses, budgets, goal } = req.body;
      
      // Seed profile
      await ensureDefaultProfile();

      // Save each in sequence
      if (Array.isArray(members)) {
        for (const m of members) await saveMemberDb(m);
      }
      if (Array.isArray(incomeCategories)) {
        for (const c of incomeCategories) {
          if (c.isCustom || c.is_custom) {
            await saveIncomeCategoryDb(c);
          }
        }
      }
      if (Array.isArray(expenseCategories)) {
        for (const c of expenseCategories) {
          if (c.isCustom || c.is_custom) {
            await saveExpenseCategoryDb(c);
          }
        }
      }
      if (Array.isArray(incomes)) {
        for (const i of incomes) await saveIncomeDb(i);
      }
      if (Array.isArray(expenses)) {
        for (const e of expenses) await saveExpenseDb(e);
      }
      if (Array.isArray(budgets)) {
        for (const b of budgets) await saveBudgetDb(b);
      }
      if (goal) {
        await saveSavingGoalDb(goal);
      }

      res.json({ success: true, message: 'Sync completed successfully!' });
    } catch (err: any) {
      console.error('Sync failed:', err);
      res.status(500).json({ error: 'Failed to sync ledger data', details: err.message });
    }
  });

  // Family Members Write & Delete
  app.post('/api/db/members', async (req, res) => {
    try {
      await saveMemberDb(req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/db/members/:id', async (req, res) => {
    try {
      await deleteMemberDb(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Categories Income
  app.post('/api/db/categories/income', async (req, res) => {
    try {
      await saveIncomeCategoryDb(req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/db/categories/income/:id', async (req, res) => {
    try {
      await deleteIncomeCategoryDb(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Categories Expense
  app.post('/api/db/categories/expense', async (req, res) => {
    try {
      await saveExpenseCategoryDb(req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/db/categories/expense/:id', async (req, res) => {
    try {
      await deleteExpenseCategoryDb(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Incomes CRUD
  app.post('/api/db/incomes', async (req, res) => {
    try {
      await saveIncomeDb(req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/db/incomes/:id', async (req, res) => {
    try {
      await deleteIncomeDb(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Expenses CRUD
  app.post('/api/db/expenses', async (req, res) => {
    try {
      await saveExpenseDb(req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/db/expenses/:id', async (req, res) => {
    try {
      await deleteExpenseDb(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Budgets
  app.post('/api/db/budgets', async (req, res) => {
    try {
      await saveBudgetDb(req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Goal
  app.post('/api/db/saving-goal', async (req, res) => {
    try {
      await saveSavingGoalDb(req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Notifications
  app.post('/api/db/notifications', async (req, res) => {
    try {
      await addNotificationDb(req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/db/notifications/read', async (req, res) => {
    try {
      await markNotificationAsReadDb(req.body.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/db/notifications/clear', async (req, res) => {
    try {
      await clearAllNotificationsDb();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Reset database state
  app.post('/api/db/reset', async (req, res) => {
    try {
      await resetDatabaseDb();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API Route: Generate AI recommendations and insights based on family ledger snapshot
  app.post('/api/gemini/insights', async (req, res) => {
    const { summary, memberSpending, categorySpending, budgets } = req.body;

    if (!ai) {
      // Rule-based fallback if GEMINI_API_KEY is missing or invalid
      console.log('Using rule-based fallback response as GEMINI_API_KEY is missing.');
      const fallbackResponse = generateLocalRuleBasedInsights(summary, memberSpending, categorySpending, budgets);
      return res.json(fallbackResponse);
    }

    try {
      const prompt = `คุณคือผู้เชี่ยวชาญด้านการเงินสำหรับครอบครัว (Family Financial Planner) หน้าที่ของคุณคือวิเคราะห์ข้อมูลรายรับ รายจ่าย และระบบงบประมาณของครอบครัวนี้ แล้วสร้างข้อมูลวิเคราะห์เชิงลึก (AI Financial Insights) เป็นภาษาไทยแบบเป็นกันเอง อบอุ่น และสร้างแรงบันดาลใจ

      นี่คือข้อมูลสรุปของเดือนนี้:
      - รายรับรวม: ${summary.totalIncome.toLocaleString()} บาท
      - รายจ่ายรวม: ${summary.totalExpense.toLocaleString()} บาท
      - ยอดคงเหลือ: ${summary.balance.toLocaleString()} บาท
      - อัตราการออม: ${summary.savingsRate}%
      - ค่าใช้จ่ายเฉลี่ยต่อวัน: ${summary.avgDailyExpense.toLocaleString()} บาท
      - คะแนนสุขภาพการเงิน: ${summary.healthScore}/100 [สถานะ: ${summary.healthStatus}]

      นี่คือการใช้จ่ายรายสมาชิกสูงสุด:
      ${JSON.stringify(memberSpending)}

      นี่คือยอดเจาะลึกรายหมวดหมู่ค่าใช้จ่าย:
      ${JSON.stringify(categorySpending)}

      นี่คืองบประมาณรายเดือนที่ผู้ใช้งานตั้งไว้ (มีหน่วยบาท):
      ${JSON.stringify(budgets)}

      จงวิเคราะห์ข้อมูลข้างต้นแล้วจัดทำข้อคิดเห็น 4 ส่วนในรูปแบบ JSON:
      1. insights: รายการวิเคราะห์ดุลบัญชีและพฤติกรรมการใช้เงิน (เช่น สังเกตหมวดหมู่ที่เกินงบประมาณ, บุคคลที่ใช้สัดส่วนสูงสุด, ดัชนีสัดส่วนอาหาร เป็นต้น) ให้มีความยาวหมวดละ 1-2 บรรทัด สั้น กระชับ แต่อัดแน่นด้วยสาระ จำนวน 3-4 ข้อ ตัวอย่าง: "ค่าอาหารคิดเป็น 38% ของค่าใช้จ่ายทั้งหมด" หรือ "ค่าน้ำมันรถจักรยานยนต์ของแม่สูงขึ้น 15% จากเป้าหมาย"
      2. recommendations: คำแนะนำเฉพาะบุคคล/พฤติกรรม เพื่อโอกาสประหยัดเงินและการออม (เช่น แนวทางการกำหนดงบสำหรับกาแฟ หรือการประหยัดของใช้ประจำบ้าน) 3-4 ข้อ เพื่อเป็นแนวทางที่นำไปปฏิบัติได้จริง (Actionable advice)
      3. warning: คำเตือนเร่งด่วนกรณีมีความเสี่ยงทางการเงิน เช่น เงินคงเหลือเหลือน้อยกว่า 10% หรือรายจ่ายกระจุกตัวเกินงบประมาณ (หรือ null หากสถานะดีมากและไม่มีจุดเสี่ยง)
      4. scoreCommentary: คำอธิบายและคำติชมอย่างอบอุ่นเกี่ยวกับคะแนนสุขภาพทางการเงิน ${summary.healthScore} คะแนน`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an elite warm, helpful personal finance assistant specializing in Thai families. You outputs valid JSON strictly matching the requested schema. Use supportive, constructive, and friendly Thai vocabulary.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              insights: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3-4 specific financial insights extracted from the spending ledger.'
              },
              recommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3-4 actionable steps the family can take to save or budget better.'
              },
              warning: {
                type: Type.STRING,
                description: 'An urgent flag or critical budget warn if savings rate is negative or low (can be null or empty).'
              },
              scoreCommentary: {
                type: Type.STRING,
                description: 'Personalized warm encouragement about their finance health score.'
              }
            },
            required: ['insights', 'recommendations', 'scoreCommentary']
          }
        }
      });

      const rawText = response.text || '{}';
      const parsedData = JSON.parse(rawText.trim());
      res.json(parsedData);
    } catch (apiError: any) {
      const errMsg = apiError?.message || String(apiError);
      if (errMsg.includes('denied access') || errMsg.includes('PERMISSION_DENIED') || apiError?.status === 403) {
        console.warn('Gemini API access denied or restricted by Google Cloud Project setup. Falling back to robust rule-based metrics analysis.');
      } else {
        console.warn('Gemini API query completed with fallback:', errMsg);
      }
      // Fallback
      const fallbackResponse = generateLocalRuleBasedInsights(summary, memberSpending, categorySpending, budgets);
      res.json(fallbackResponse);
    }
  });

  // API Route: Interactive financial consultation chat
  app.post('/api/gemini/chat', async (req, res) => {
    const { messages, ledgerContext } = req.body;

    if (!ai) {
      return res.json({
        reply: 'ฉันคือ AI ผู้ช่วยจำลอง เนื่องจากคีย์ GEMINI_API_KEY ยังไม่ได้ถูกเปิดใช้งาน แต่ตารางและระบบบัญชีของครอบครัวคุณทำงานได้อย่างสมบูรณ์แบบ! หากคีย์เชื่อมต่อแล้ว ฉันสามารถคุยวิเคราะห์การเงินและแนะนำแนวปฏิบัติให้คุณได้ทันทีค่ะ'
      });
    }

    try {
      // Synthesize prompt containing recent messages and financial context
      const chatContextPrompt = `คุณคือ "โค้ชออมเงิน" AI ที่ปรึกษาการเงินอารมณ์ดี อบอุ่น คอยให้คำแนะนำช่วยเหลือผู้ใช้ใน "Family Finance Manager"

      นี่คือบริบททางการเงินล่าสุดของครอบครัวนี้ในเดือนปัจจุบัน:
      - รายรับ: ${ledgerContext.summary.totalIncome.toLocaleString()} บาท
      - รายจ่าย: ${ledgerContext.summary.totalExpense.toLocaleString()} บาท
      - เงินคงเหลือชำระแล้ว: ${ledgerContext.summary.balance.toLocaleString()} บาท
      - ยอดเงินออมสะสม: ${ledgerContext.summary.savings?.toLocaleString() || '0'} บาท
      - สุขภาพทางการเงิน: ${ledgerContext.summary.healthStatus} (${ledgerContext.summary.healthScore}/100)

      จงตอบคำถามผู้ใช้ด้วยความใส่ใจ แนะนำกระตุ้นให้เด็กๆ (น้องเอญ่า น้องอลิซ) ร่วมมือออมเงิน และให้คำตอบเชิงลึกที่เป็นประโยชน์ ปรับแต่งให้สอดคล้องกัน แนะนำให้ตีกรอบความเข้าใจง่ายๆ`;

      const chatInput = messages[messages.length - 1]?.content || 'สวัสดี';

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: chatInput,
        config: {
          systemInstruction: chatContextPrompt
        }
      });

      res.json({ reply: response.text });
    } catch (chatError: any) {
      const errMsg = chatError?.message || String(chatError);
      if (errMsg.includes('denied access') || errMsg.includes('PERMISSION_DENIED') || chatError?.status === 403) {
        console.warn('Gemini API chat helper access restricted by project setup.');
      } else {
        console.warn('Chat error:', errMsg);
      }
      res.json({
        reply: 'โค้ชอัจฉริยะกำลังวิเคราะห์ข้อมูลภายในอยู่ค่ะ แต่คุณยังสามารถลงทะเบียนแก้ไขรายการบัญชี และเปรียบเทียบสัดส่วนและเป้าหมายเงินออมได้ตามปกติอย่างรวดเร็วค่ะ!'
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    
    // Check and initialize default profile details if connected
    isDbConnected().then(async (connected) => {
      if (connected) {
        console.log('Database connected on startup! Ensuring default guest family profile exists...');
        await ensureDefaultProfile();
      } else {
        console.log('Database running in Local Storage fallback mode (no database connection configured).');
      }
    });
  });
}

// Rule-based insight engine in case API keys are not provided
function generateLocalRuleBasedInsights(summary: any, memberSpending: any[], categorySpending: any[], budgets: any[]) {
  const insights: string[] = [];
  const recommendations: string[] = [];
  let warning: string | null = null;
  let scoreCommentary = '';

  // 1. Analyze categories
  const foodSpend = categorySpending.find(c => c.category_id === 'exp_food' || c.category_name === 'ค่าอาหาร')?.total_category_expense || 0;
  const roomRent = categorySpending.find(c => c.category_id === 'exp_room' || c.category_name === 'ค่าห้องพัก')?.total_category_expense || 0;
  
  const totalExpense = summary.totalExpense || 1;
  const foodPct = Math.round((foodSpend / totalExpense) * 100);

  if (foodSpend > 0) {
    insights.push(`ค่าอาหารรวมถึงตลาดสดคิดเป็นประมาณ ${foodPct}% ของค่าใช้จ่ายในครอบครัวทั้งหมด`);
  } else {
    insights.push(`ค่าใช้จ่ายส่วนใหญ่หมุนเวียนอยู่ในหมวดหมู่จำเป็นพื้นฐาน เช่น ค่าห้องพักและค่าน้ำประปา`);
  }

  // Personal category analysis
  const coffeeCat = categorySpending.find(c => c.category_name === 'กาแฟ');
  if (coffeeCat && coffeeCat.total_category_expense > 0) {
    insights.push(`ยอดใช้จ่ายสะสมกับหมวดเครื่องดื่มกาแฟของครอบครัวอยู่ที่ ${coffeeCat.total_category_expense.toLocaleString()} บาท`);
  } else {
    insights.push(`ค่าข้าวน้องเอญ่าและค่ารถโรงเรียนของน้องอลิซได้รับการจัดงบประจำเป็นระเบียบ`);
  }

  // Rider revenue highlight
  insights.push(`รายได้เสริมจากค่าวิ่งไรเดอร์แอปเขียวของแม่ช่วยยกระดับความคล่องตัวของกระแสเงินสดและสัดส่วนการออมได้ดี`);

  // 2. Recommendations
  recommendations.push('ลองร่วมกันปรับแผนลดค่าน้ำดื่มสำเร็จรูป โดยหันมาต้มน้ำหรือกดตู้น้ำกรองที่ได้รับมาตรฐาน มีโอกาสประหยัดเฉลี่ย 400 บาท/เดือน');
  recommendations.push('ชักชวนน้องเอญ่าและน้องอลิซให้พกกระติกน้ำไปโรงเรียนเพื่อฝึกวินัยประหยัดทรัพยากรและค่าใช้จ่ายของเล่นส่วนตัว');
  recommendations.push('ร่วมมือทำกับข้าวร่วมกันทานเย็นวันหยุดแทนการกินข้าวนอกบ้านบ่อยๆ เสริมความอบอุ่นใจ และช่วยประหยัดอย่างน้อย 1,200 บาทต่อเดือน');

  // 3. Warning
  if (summary.balance < 0) {
    warning = '🚨 สัญญานอันตราย: รายจ่ายในเดือนนี้เกินกว่ารายรับรวมทั้งหมด! ควรระงับรายจ่ายไม่จำเป็นเพื่อดุลบัญชีก่อนสิ้นเดือน';
  } else if (summary.savingsRate < 10) {
    warning = '⚠️ ข้อควรระวัง: อัตราส่วนออมทรัพย์ค่อนข้างต่ำ (ต่ำกว่า 10%) แนะนำหลีกเลี่ยงการเพิ่มหนี้สินก้อนชั่วคราว';
  }

  // 4. Score Commentary
  if (summary.healthScore >= 90) {
    scoreCommentary = `ยินดีด้วยอย่างยิ่ง! ครอบครัวของคุณได้ ${summary.healthScore} คะแนน ซึ่งอยู่ในเกณฑ์ "ยอดเยี่ยมมาก" ระบบควบคุมงบประมาณและการแบ่งสัดส่วนเงินดีเยี่ยมเป็นต้นแบบได้สบายๆ เลยค่ะ`;
  } else if (summary.healthScore >= 75) {
    scoreCommentary = `เยี่ยมมาก! คะแนนสูงถึง ${summary.healthScore} สะท้อนถึงการจัดสรรที่ดีเยี่ยม มีเงินออมหล่อเลี้ยงด่านหน้า ดำเนินการต่อด้วยแผนอุดรอยรั่วเล็กน้อยนะคะ`;
  } else {
    scoreCommentary = `คะแนนสุขภาพการเงินรอบนี้คือ ${summary.healthScore} คะแนน อยู่ในแดนกระตุ้นเตือน แนะนำช่วยกันส่องรายการค่าน้ำมันรถจักรยานยนต์และปรับงบของใช้ เพื่อพยุงอัตราการเก็บออมค่ะ`;
  }

  return { insights, recommendations, warning, scoreCommentary };
}

startServer();
