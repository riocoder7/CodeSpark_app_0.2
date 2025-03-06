import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

interface LanguageOption {
  label: string;
  value: string;
}

const languages: LanguageOption[] = [
  { label: 'Python', value: '71' },
  { label: 'C++', value: '54' },
  { label: 'Java', value: '62' },
  { label: 'C', value: '50' },
  { label: 'JavaScript', value: '63' },
  { label: 'Rust', value: '73' },
  { label: 'Ruby', value: '72' },
  { label: 'Go', value: '60' },
  { label: 'PHP', value: '68' },
];

const defaultCodeSnippets: Record<string, string> = {
  '71': `# Python Code
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))`,
  '54': `// C++ Code
#include <iostream>
using namespace std;
int main() {
    string name;
    cout << "Enter your name: ";
    cin >> name;
    cout << "Hello, " << name << "!" << endl;
    return 0;
}`,
  '62': `// Java Code
import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter your name: ");
        String name = sc.nextLine();
        System.out.println("Hello, " + name + "!");
    }
}`,
  '50': `// C Code
#include <stdio.h>
int main() {
    char name[50];
    printf("Enter your name: ");
    scanf("%s", name);
    printf("Hello, %s!\\n", name);
    return 0;
}`,
  '63': `// JavaScript Code
function greet(name) {
    return "Hello, " + name + "!";
}
console.log(greet("World"));`,
  '73': `// Rust Code
use std::io;
fn main() {
    let mut name = String::new();
    println!("Enter your name: ");
    io::stdin().read_line(&mut name).expect("Failed to read input");
    println!("Hello, {}!", name.trim());
}`,
  '72': `# Ruby Code
def greet(name)
  return "Hello, #{name}!"
end

puts greet("World")`,
  '60': `// Go Code
package main
import "fmt"
func main() {
    var name string
    fmt.Print("Enter your name: ")
    fmt.Scanln(&name)
    fmt.Println("Hello,", name)
}`,
  '68': `<?php
// PHP Code
function greet($name) {
    return "Hello, " . $name . "!";
}
echo greet("World");
?>`,
};

const codeRequiresInput = (language: string, code: string): boolean => {
  switch (language) {
    case '71':
      return code.includes("input(");
    case '54':
      return code.includes("cin >>");
    case '62':
      return code.includes("Scanner");
    case '50':
      return code.includes("scanf(");
    case '63':
      return code.includes("prompt(");
    case '73':
      return code.includes("read_line");
    case '72':
      return code.includes("gets");
    case '60':
      return code.includes("Scanln");
    case '68':
      return code.includes("fgets") || code.includes("readline");
    default:
      return false;
  }
};

const CompilerScreen: React.FC = () => {
  const router = useRouter();
  const [userInput, setUserInput] = useState('');
  const [language, setLanguage] = useState(languages[0].value);
  const [code, setCode] = useState(defaultCodeSnippets[languages[0].value]);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const showInputField = codeRequiresInput(language, code);

  const handleLanguageChange = (selectedLanguage: string) => {
    setLanguage(selectedLanguage);
    setCode(defaultCodeSnippets[selectedLanguage]);
    setUserInput('');
    setOutput('');
  };

  const handleCompile = async () => {
    setLoading(true);
    setOutput('');
    try {
      const response = await fetch(
        'https://judge029.p.rapidapi.com/submissions?base64_encoded=false&wait=true',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-rapidapi-host': 'judge029.p.rapidapi.com',
            'x-rapidapi-key': 'de5e05f3e6mshe002c4fa7cc298dp16d096jsn9b70bf4e91a5', // Replace with your API key
          },
          body: JSON.stringify({
            source_code: code,
            language_id: parseInt(language),
            stdin: showInputField ? userInput : "",
          }),
        }
      );
      const data = await response.json();
      setOutput(data.stdout || data.compile_output || data.stderr || 'No output');
    } catch (error) {
      console.error('Error compiling code:', error);
      setOutput('Error compiling code. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
    colors={["rgb(150, 192, 255)", "white","rgb(150, 192, 255)"]}
      style={styles.gradientWrapper}
    >
      {/* Header with gradient (light theme) */}
      <LinearGradient colors={["rgb(11, 103, 240)", "rgb(60, 138, 255)"]} style={styles.headerContainer}>
        <TouchableOpacity style={styles.iconContainer} onPress={() => router.back()}>
          <View style={styles.iconBadge}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Compiler</Text>
      </LinearGradient>

      {/* Main white card container */}
      <View style={styles.containerCard}>
        <ScrollView contentContainerStyle={styles.containerScroll}>
          {/* Top Bar: Dropdown & Run Button */}
          <View style={styles.topBar}>
            <Picker
              selectedValue={language}
              mode="dropdown"
              onValueChange={handleLanguageChange}
              style={styles.picker}
            >
              {languages.map((lang) => (
                <Picker.Item key={lang.value} label={lang.label} value={lang.value} />
              ))}
            </Picker>

            <TouchableOpacity style={styles.runButton} onPress={handleCompile} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Run Code</Text>}
            </TouchableOpacity>
          </View>

          {/* Code Editor */}
          <Text style={styles.editorLabel}>Code Editor:</Text>
          <TextInput
            style={styles.codeInput}
            multiline
            value={code}
            onChangeText={setCode}
            autoCorrect={false}
            spellCheck={false}
            autoCapitalize="none"
          />

          {/* Conditionally show User Input Field */}
          {showInputField && (
            <>
              <Text style={styles.label}>Enter Input:</Text>
              <TextInput
                style={styles.inputField}
                placeholder="Enter your input (one per line)..."
                placeholderTextColor="#999"
                value={userInput}
                onChangeText={setUserInput}
                multiline
                textAlignVertical="top"
              />
            </>
          )}

          {/* Output Section */}
          <View style={styles.outputSection}>
            <View style={styles.outputHeader}>
              <Text style={styles.label}>Output:</Text>
              <TouchableOpacity style={styles.clearButton} onPress={() => setOutput('')}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.outputContainer}>
              <ScrollView style={styles.outputScroll}>
                <Text style={styles.output}>{output}</Text>
              </ScrollView>
            </View>
          </View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientWrapper: {
    flex: 1,
  },
  iconContainer: { position: 'absolute', top: 15, left: 20, zIndex: 1 },
  iconBadge: { backgroundColor: "rgb(79, 149, 255)", padding: 8, borderRadius: 10 },
  headerTitle: { color: 'white', fontSize: 24, fontFamily: 'outfit-bold', marginVertical: 10 },
  headerContainer: {
    paddingTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 10,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  
  backButton: {
    marginRight: 10,
  },
  headerText: {
    fontFamily: 'outfit-bold',
    fontSize: 22,
    color: Colors.black,
  },
  containerCard: {
    flex: 1,
    backgroundColor: '#FFF',
    margin: 15,
    borderRadius: 10,
    padding: 10,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    // Elevation for Android
    elevation: 3,
  },
  containerScroll: {
    flexGrow: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  picker: {
    width: '60%',
    backgroundColor: Colors.gray,
    borderRadius: 8,
    color: Colors.black,
  },
  runButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'outfit-bold',
  },
  editorLabel: {
    fontSize: 16,
    fontFamily: 'outfit-bold',
    marginBottom: 6,
    color: '#333',
  },
  codeInput: {
    height: 180,
    backgroundColor: '#1e1e1e', // Dark background for code editor
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    color: '#d4d4d4', // Light text
    fontFamily: 'monospace',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  label: {
    fontSize: 16,
    fontFamily: 'outfit-bold',
    marginTop: 10,
    color: '#333',
  },
  inputField: {
    height: 50,
    backgroundColor: Colors.gray,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 16,
    marginTop: 5,
    color: '#000',
    fontFamily: 'monospace',
  },
  outputSection: {
    marginTop: 10,
  },
  outputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  outputContainer: {
    marginTop: 10,
    backgroundColor: '#1e1e1e', // Dark background for output
    borderRadius: 10,
    minHeight: 80,
    padding: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  outputScroll: {
    maxHeight: 120,
  },
  output: {
    fontSize: 16,
    color: '#d4d4d4', // Light text
    fontFamily: 'monospace',
  },
  clearButton: {
    backgroundColor: Colors.green,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
  },
  clearText: {
    fontSize: 16,
    fontFamily: 'outfit-bold',
    color: '#FFF',
  },
});

export default CompilerScreen;
