"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2, Check, X, DollarSign, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  paid_by: string;
  split_with: string[];
  date: string;
  payment_method?: string | null;
  receipt_url?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

interface BudgetTabProps {
  tripId?: string;
  expenses: Expense[];
  collaborators?: string[];
  currency?: string;
  onAddExpense?: (expense: Partial<Expense>) => Promise<void>;
  onUpdateExpense?: (id: string, updates: Partial<Expense>) => Promise<void>;
  onDeleteExpense?: (id: string) => Promise<void>;
}

const DEFAULT_EXPENSES: Expense[] = [
  {
    id: '1',
    category: 'Flights',
    description: 'JFK - NRT Roundtrip',
    amount: 2400,
    currency: 'USD',
    paid_by: 'Miguel',
    split_with: ['Miguel', 'Camille'],
    date: '2026-01-05',
    payment_method: 'Credit Card',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    category: 'Hotel',
    description: 'Hyatt Regency (3 nights)',
    amount: 850,
    currency: 'USD',
    paid_by: 'Camille',
    split_with: ['Miguel', 'Camille'],
    date: '2026-01-10',
    payment_method: 'Credit Card',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    category: 'Transport',
    description: 'JR Pass (7 days)',
    amount: 600,
    currency: 'USD',
    paid_by: 'Camille',
    split_with: ['Miguel', 'Camille'],
    date: '2026-01-12',
    payment_method: 'Online',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    category: 'Food',
    description: 'Dinner at Omoide Yokocho',
    amount: 120,
    currency: 'USD',
    paid_by: 'Miguel',
    split_with: ['Miguel', 'Camille'],
    date: '2026-01-18',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const EXPENSE_CATEGORIES = [
  'Flights',
  'Hotel',
  'Transport',
  'Food',
  'Activities',
  'Shopping',
  'Other'
];

const PAYMENT_METHODS = [
  'Credit Card',
  'Debit Card',
  'Cash',
  'Online',
  'Bank Transfer'
];

export function BudgetTab({
  tripId,
  expenses: initialExpenses = [],
  collaborators = ['Camille', 'Miguel'],
  currency = 'USD',
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense
}: BudgetTabProps) {
  const [expenses, setExpenses] = useState<Expense[]>(
    initialExpenses.length > 0 ? initialExpenses : DEFAULT_EXPENSES
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [splitEqually, setSplitEqually] = useState(true);

  // New expense form state
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    category: 'Food',
    description: '',
    amount: 0,
    currency: currency,
    paid_by: collaborators[0],
    split_with: collaborators,
    date: new Date().toISOString().split('T')[0],
    payment_method: 'Credit Card'
  });

  // Calculate totals and balances
  const calculations = useMemo(() => {
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const paidByPerson: Record<string, number> = {};
    const owedByPerson: Record<string, number> = {};

    collaborators.forEach(person => {
      paidByPerson[person] = 0;
      owedByPerson[person] = 0;
    });

    expenses.forEach(expense => {
      // Track what each person paid
      paidByPerson[expense.paid_by] = (paidByPerson[expense.paid_by] || 0) + expense.amount;

      // Calculate what each person owes
      const splitAmount = expense.amount / expense.split_with.length;
      expense.split_with.forEach(person => {
        owedByPerson[person] = (owedByPerson[person] || 0) + splitAmount;
      });
    });

    // Calculate net balances (positive means owed, negative means owes)
    const balances: Record<string, number> = {};
    collaborators.forEach(person => {
      balances[person] = paidByPerson[person] - owedByPerson[person];
    });

    // Calculate who owes whom
    const settlements: Array<{ from: string; to: string; amount: number }> = [];
    const people = Object.keys(balances).sort((a, b) => balances[a] - balances[b]);

    let i = 0;
    let j = people.length - 1;
    const tempBalances = { ...balances };

    while (i < j) {
      const debtor = people[i];
      const creditor = people[j];
      const amount = Math.min(-tempBalances[debtor], tempBalances[creditor]);

      if (amount > 0.01) {
        settlements.push({ from: debtor, to: creditor, amount });
        tempBalances[debtor] += amount;
        tempBalances[creditor] -= amount;
      }

      if (Math.abs(tempBalances[debtor]) < 0.01) i++;
      if (Math.abs(tempBalances[creditor]) < 0.01) j--;
    }

    return {
      totalSpent,
      paidByPerson,
      owedByPerson,
      balances,
      settlements
    };
  }, [expenses, collaborators]);

  const handleAddExpense = async () => {
    if (!newExpense.description || !newExpense.amount || newExpense.amount <= 0) {
      return;
    }

    const expense: Expense = {
      id: `expense-${Date.now()}`,
      category: newExpense.category || 'Other',
      description: newExpense.description,
      amount: newExpense.amount,
      currency: newExpense.currency || currency,
      paid_by: newExpense.paid_by || collaborators[0],
      split_with: splitEqually ? collaborators : (newExpense.split_with || []),
      date: newExpense.date || new Date().toISOString().split('T')[0],
      payment_method: newExpense.payment_method,
      notes: newExpense.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setExpenses([...expenses, expense]);
    setIsAddDialogOpen(false);
    resetNewExpense();

    if (onAddExpense) {
      try {
        await onAddExpense(expense);
      } catch (error) {
        console.error("Failed to add expense:", error);
      }
    }
  };

  const handleDeleteExpense = async (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));

    if (onDeleteExpense) {
      try {
        await onDeleteExpense(id);
      } catch (error) {
        console.error("Failed to delete expense:", error);
      }
    }
  };

  const resetNewExpense = () => {
    setNewExpense({
      category: 'Food',
      description: '',
      amount: 0,
      currency: currency,
      paid_by: collaborators[0],
      split_with: collaborators,
      date: new Date().toISOString().split('T')[0],
      payment_method: 'Credit Card'
    });
    setSplitEqually(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Flights': 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
      'Hotel': 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
      'Transport': 'bg-green-500/10 text-green-700 dark:text-green-400',
      'Food': 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
      'Activities': 'bg-pink-500/10 text-pink-700 dark:text-pink-400',
      'Shopping': 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
      'Other': 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
    };
    return colors[category] || colors['Other'];
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Budget & Expenses</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track expenses and split costs with your travel companions
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Expenses Table */}
        <div className="col-span-2 border rounded-xl overflow-hidden bg-background">
          <div className="p-4 border-b flex justify-between items-center bg-muted/50">
            <h3 className="font-semibold">Expenses</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Split equally</span>
              <Switch checked={splitEqually} onCheckedChange={setSplitEqually} />
            </div>
          </div>

          {expenses.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No expenses yet</p>
              <p className="text-sm mt-1">Add your first expense to start tracking</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/20">
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Description</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Amount</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Paid By</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((expense) => (
                      <tr key={expense.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-3 text-muted-foreground">
                          {new Date(expense.date).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className={cn("text-xs", getCategoryColor(expense.category))}>
                            {expense.category}
                          </Badge>
                        </td>
                        <td className="p-3">{expense.description}</td>
                        <td className="p-3 text-right font-mono font-medium">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="p-3 text-right">
                          <Badge variant="outline" className="text-xs">
                            {expense.paid_by}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteExpense(expense.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary & Settlements */}
        <div className="space-y-4">
          {/* Total Budget Card */}
          <div className="border rounded-xl p-6 bg-background shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
              <TrendingUp className="h-4 w-4" />
              Total Spent
            </div>
            <p className="text-4xl font-bold">{formatCurrency(calculations.totalSpent)}</p>
          </div>

          {/* Individual Spending */}
          <div className="border rounded-xl p-6 bg-background shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
              <Users className="h-4 w-4" />
              Individual Spending
            </div>
            <div className="space-y-3">
              {collaborators.map(person => (
                <div key={person}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{person} paid</span>
                    <span className="font-medium">
                      {formatCurrency(calculations.paidByPerson[person] || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{person}'s share</span>
                    <span>{formatCurrency(calculations.owedByPerson[person] || 0)}</span>
                  </div>
                  {person !== collaborators[collaborators.length - 1] && (
                    <div className="h-px bg-border my-3" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Settlements */}
          {calculations.settlements.length > 0 && (
            <div className="border rounded-xl p-6 bg-primary/5 border-primary/20">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                Settlements
              </div>
              <div className="space-y-2">
                {calculations.settlements.map((settlement, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-primary font-medium">
                      {settlement.from} owes {settlement.to}
                    </span>
                    <span className="font-bold text-primary">
                      {formatCurrency(settlement.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (!open) resetNewExpense();
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
            <DialogDescription>
              Record a new expense for your trip
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newExpense.category}
                  onValueChange={(val) => setNewExpense({ ...newExpense, category: val })}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount ({currency})</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={newExpense.amount || ''}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g., Dinner at sushi restaurant"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paid-by">Paid By</Label>
                <Select
                  value={newExpense.paid_by}
                  onValueChange={(val) => setNewExpense({ ...newExpense, paid_by: val })}
                >
                  <SelectTrigger id="paid-by">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {collaborators.map(person => (
                      <SelectItem key={person} value={person}>{person}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select
                value={newExpense.payment_method || ''}
                onValueChange={(val) => setNewExpense({ ...newExpense, payment_method: val })}
              >
                <SelectTrigger id="payment-method">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map(method => (
                    <SelectItem key={method} value={method}>{method}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes..."
                value={newExpense.notes || ''}
                onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddExpense}
              disabled={!newExpense.description || !newExpense.amount || newExpense.amount <= 0}
            >
              Add Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
