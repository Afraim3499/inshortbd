-- Create Playbook Strategies Table
CREATE TABLE playbook_strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_index INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT, -- HTML content for unlocked strategies
    is_locked BOOLEAN DEFAULT false,
    tags JSONB DEFAULT '[]'::jsonb, -- Array of {text: string, colorClass: string}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE playbook_strategies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public strategies are viewable by everyone" ON playbook_strategies
    FOR SELECT USING (true);

-- Seed Data (Mirrors current hardcoded content)
INSERT INTO playbook_strategies (order_index, title, is_locked, content, tags) VALUES
(1, 'Pay Yourself First', false, 
 '<div class="space-y-8 font-serif">
    <p class="text-2xl text-gray-700 mb-8 leading-relaxed">
        <strong>The Strategy:</strong> Automatically transfer 20% of every paycheck to investments BEFORE
        paying any bills. This "reverse budgeting" ensures wealth-building happens first.
    </p>
    <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200 font-sans">
        <h4 class="text-xl font-black mb-4 font-display">Real Example: Maria''s Journey</h4>
        <div class="space-y-2 text-sm">
            <div class="flex justify-between"><span class="text-gray-600">Age Started:</span><span class="font-bold">28</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Annual Salary:</span><span class="font-bold">$55,000</span></div>
            <div class="h-px bg-gray-300 my-3"></div>
            <div class="flex justify-between text-lg"><span class="font-bold text-green-700">After 10 Years:</span><span class="font-black text-2xl text-green-600">$187K</span></div>
        </div>
    </div>
 </div>',
 '[{"text": "✅ Easy", "colorClass": "bg-green-100 text-green-700"}, {"text": "🚀 High Impact", "colorClass": "bg-purple-100 text-purple-700"}]'::jsonb
),
(2, 'The 3-Income Rule', false,
 '<div class="space-y-6">
    <p class="text-2xl text-gray-700 mb-8 font-serif">
        <strong>The Strategy:</strong> Build 3 income streams - primary job, side business, passive income.
    </p>
 </div>',
 '[{"text": "⚡ Medium", "colorClass": "bg-yellow-100 text-yellow-700"}]'::jsonb
),
(3, 'Real Estate Leverage', true, null, '[]'::jsonb),
(4, 'Tax Efficiency Schema', true, null, '[]'::jsonb),
(5, 'Business Systems', true, null, '[]'::jsonb),
(6, 'Global Diversification', true, null, '[]'::jsonb),
(7, 'Legacy Planning', true, null, '[]'::jsonb);
