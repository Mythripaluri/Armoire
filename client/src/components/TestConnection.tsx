import { useState } from 'react';
import { supabase } from '@/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TestConnection = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      // Test 1: Try to query profiles table directly
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (profilesError) {
        setResult(`❌ Profiles table error: ${profilesError.message}`);
        return;
      }
      
      // Test 2: Try to query wardrobe_items table
      const { data: wardrobeData, error: wardrobeError } = await supabase
        .from('wardrobe_items')
        .select('*')
        .limit(1);
      
      if (wardrobeError) {
        setResult(`❌ Wardrobe table error: ${wardrobeError.message}`);
        return;
      }
      
      setResult(`✅ Connection successful! Both tables exist and are accessible.`);
      
    } catch (err) {
      setResult(`❌ Unexpected Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const testSignup = async () => {
    setLoading(true);
    setResult('Testing signup...');
    
    try {
      const testEmail = `test${Date.now()}@example.com`;
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'testpassword123',
        options: {
          data: {
            full_name: 'Test User'
          }
        }
      });
      
      if (error) {
        setResult(`❌ Signup Error: ${error.message}\n\nDetailed info: ${JSON.stringify(error, null, 2)}`);
      } else {
        setResult(`✅ Signup successful! User: ${data.user?.email}\nUser ID: ${data.user?.id}`);
      }
    } catch (err) {
      setResult(`❌ Unexpected Signup Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const testManualProfile = async () => {
    setLoading(true);
    setResult('Testing manual profile creation...');
    
    try {
      const testUserId = '550e8400-e29b-41d4-a716-446655440000';
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: testUserId,
            email: 'manual-test@example.com'
          }
        ])
        .select();
      
      if (error) {
        setResult(`❌ Manual Profile Error: ${error.message}\n\nDetailed info: ${JSON.stringify(error, null, 2)}`);
      } else {
        setResult(`✅ Manual profile creation successful! Data: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (err) {
      setResult(`❌ Unexpected Manual Profile Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>🔧 Debug Connection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testConnection} disabled={loading} className="w-full">
          Test Database Connection
        </Button>
        <Button onClick={testSignup} disabled={loading} className="w-full">
          Test User Signup
        </Button>
        <Button onClick={testManualProfile} disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600">
          Test Manual Profile Creation
        </Button>
        {result && (
          <div className="p-3 bg-gray-100 rounded-md">
            <pre className="text-sm whitespace-pre-wrap">{result}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TestConnection;