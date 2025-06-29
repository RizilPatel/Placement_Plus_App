import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Image,
    ActivityIndicator,
    Animated,
    Keyboard,
    SafeAreaView
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useUser } from "../../context/userContext.js"

// Import bot avatar
import botAvatar from "@/assets/images/chatbot.png";

// Sample quick questions
const quickQuestions = [
    "prepare for campus placements",
    "upcoming companies?",
    "Resume writing tips",
    "how to prepare for interview",
    "placement statistics",
    "Eligibility criteria",
];

const intents = {
    greeting: {
        patterns: ["hello", "hi", "hey", "greetings", "good morning", "good afternoon", "hi there", "hello there"],
        responses: [
            "Hello! I'm your Placement Plus Assistant. How can I help you today?",
            "Hi there! I'm here to help with all your placement-related queries.",
            "Hello! Looking for placement assistance? I'm here to help!"
        ]
    },

    farewell: {
        patterns: ["bye", "goodbye", "see you", "talk to you later", "thanks bye", "exit", "close"],
        responses: [
            "Goodbye! Feel free to come back if you have more questions.",
            "See you later! Good luck with your placements!",
            "Have a great day! Come back anytime for placement assistance."
        ]
    },

    thanks: {
        patterns: ["thank you", "thanks", "appreciate it", "thank you so much", "thanks a lot"],
        responses: [
            "You're welcome! Happy to help with your placement journey.",
            "Anytime! I'm here to support your career goals.",
            "Glad I could help! Any other questions about placements?"
        ]
    },

    placement_preparation: {
        patterns: ["how to prepare", "placement preparation", "get ready for placement", "prepare for campus placements", "how do I prepare"],
        responses: [
            "For placement preparation, focus on these key areas:\n\n1. Technical skills: Practice coding problems and revise core subjects.\n2. Resume: Create a strong, error-free resume highlighting your strengths.\n3. Aptitude: Practice quantitative, logical reasoning, and verbal ability questions.\n4. Interview skills: Prepare for HR and technical interviews with mock sessions.\n5. Company research: Study companies visiting campus and their requirements.",
            "Preparing for placements involves several steps:\n\n1. Update your resume and LinkedIn profile.\n2. Practice technical skills relevant to your field.\n3. Improve communication skills through mock interviews.\n4. Work on aptitude and reasoning questions.\n5. Stay updated on industry trends.\n\nWould you like specific resources for any of these areas?"
        ]
    },

    upcoming_companies: {
        patterns: ["upcoming companies", "companies visiting", "next month companies", "which companies", "placement schedule", "recruitment schedule"],
        responses: [
            {
                text: "Here are the companies visiting next month:\n\n• Microsoft - May 2-3\n• Accenture - May 5\n• TCS - May 10-12\n• Infosys - May 15\n• Amazon - May 20\n• Google - May 25\n\nYou can view all upcoming companies and their eligibility criteria.",
                button: {
                    label: "View All Companies",
                    route: "/screens/UpcomingCompanies"
                }
            },
            {
                text: "The upcoming companies for campus recruitment are:\n\n• JP Morgan - May 4\n• Deloitte - May 8-9\n• Wipro - May 14\n• IBM - May 18\n• Oracle - May 22-23\n• Samsung - May 27\n\nTap the button below to view the complete schedule and register in time.",
                button: {
                    label: "View Full Schedule",
                    route: "screens/UpcomingCompanies"
                }
            }
        ]
    },

    resume_tips: {
        patterns: ["resume", "CV", "resume tips", "how to make resume", "resume writing", "resume help", "improve resume"],
        responses: [
            "Here are some resume writing tips for placements:\n\n1. Keep it concise (1-2 pages)\n2. Highlight relevant projects and skills\n3. Quantify achievements when possible\n4. Include technical skills with proficiency levels\n5. Proofread carefully for errors\n6. Customize for each application\n\nYou can upload your resume in the 'Upload Resume' section for review.",
            "For creating an effective placement resume:\n\n1. Start with a brief professional summary\n2. List relevant coursework and GPA\n3. Emphasize technical skills and certifications\n4. Include projects with your specific contributions\n5. Add extracurricular activities showing leadership\n6. Use action verbs and keywords\n\nWould you like me to review your resume? Upload it in the app."
        ]
    },

    interview_preparation: {
        patterns: ["interview", "interview tips", "interview preparation", "how to prepare for interview", "interview questions"],
        responses: [
            "To prepare for placement interviews:\n\n1. Technical preparation: Review core subjects and practice coding problems.\n2. Company research: Study the company, its products, values, and recent news.\n3. Behavioral questions: Prepare examples using the STAR method.\n4. Questions to ask: Prepare thoughtful questions for interviewers.\n5. Mock interviews: Practice with peers or mentors.\n\nCheck the 'Interview Questions' section for company-specific questions.",
            "Interview preparation strategies:\n\n1. Study common technical questions for your role\n2. Practice explaining your projects clearly\n3. Prepare for situational and behavioral questions\n4. Work on communication and body language\n5. Dress professionally and arrive early\n\nVisit the 'Connect with Alumni' section to get advice from successful graduates."
        ]
    },

    placement_stats: {
        patterns: ["placement statistics", "placement record", "previous placements", "highest package", "average salary", "placement stats"],
        responses: [
            "Our placement statistics for last year:\n\n• Overall placement rate: 92%\n• Highest package: ₹45 LPA (Google)\n• Average package: ₹12.5 LPA\n• Companies visited: 85+\n• International offers: 24\n\nFor detailed branch-wise statistics, check the 'Branch Stats' section.",
            "Recent placement highlights:\n\n• Computer Science: 98% placed, avg. ₹18.2 LPA\n• Electronics: 94% placed, avg. ₹14.8 LPA\n• Mechanical: 89% placed, avg. ₹10.5 LPA\n• Civil: 85% placed, avg. ₹9.2 LPA\n\nVisit 'Current Year Placement' for this year's ongoing statistics."
        ]
    },

    eligibility_criteria: {
        patterns: ["eligibility", "criteria", "eligibility criteria", "who can apply", "minimum requirements", "cgpa requirement"],
        responses: [
            "General eligibility criteria for campus placements:\n\n1. Minimum CGPA: 6.5/10 (may vary by company)\n2. No active backlogs\n3. Attendance minimum 75%\n4. All semesters cleared in first attempt\n\nNote: Specific companies may have additional requirements. Check company profiles in the app for details.",
            "To be eligible for placements, you need:\n\n1. CGPA of 7.0+ for most product companies\n2. CGPA of 6.0+ for most service companies\n3. No history of backlogs\n4. All required documentation completed\n\nFor specific company eligibility, check the 'Upcoming Companies' section."
        ]
    },

    placement_policies: {
        patterns: ["placement policy", "rules", "placement rules", "one job policy", "multiple offers", "placement guidelines"],
        responses: [
            "Key placement policies to know:\n\n1. One Job Policy: Once you accept an offer, you're out of the placement process\n2. Three Interview Rule: Maximum of three interview opportunities\n3. Attendance: Mandatory to attend pre-placement talks\n4. Dress Code: Formal attire for all placement activities\n5. Documents: All documents must be verified before interviews\n\nCheck 'Placement Policies' section for the complete rulebook.",
            "Important placement policies:\n\n1. Dream Company Option: Students can wait for preferred companies despite offers\n2. Registration Deadline: Must register 48 hours before company visit\n3. No-Show Penalty: Missing interviews after registration may result in blacklisting\n4. Ethical Code: Honesty in resume and interviews is mandatory\n\nVisit the 'Placement Policies' section for more details."
        ]
    },

    technical_preparation: {
        patterns: ["technical preparation", "coding practice", "technical interview", "technical skills", "coding questions", "technical subjects"],
        responses: [
            "For technical preparation:\n\n1. Data Structures & Algorithms: Practice on LeetCode, HackerRank\n2. Core subjects: Review fundamentals of your specialization\n3. System Design: For experienced positions\n4. Programming Languages: Be proficient in at least 2-3 languages\n5. Projects: Be prepared to explain your projects in detail\n\nThe 'Interview Questions' section has company-specific technical questions.",
            "Technical interview preparation tips:\n\n1. Practice 150+ coding problems (easy to hard)\n2. Implement important algorithms from scratch\n3. Understand time and space complexity analysis\n4. Review operating systems, DBMS, and networking concepts\n5. Participate in mock technical interviews\n\nConnect with seniors through 'Alumni Connect' for guidance."
        ]
    },

    aptitude_preparation: {
        patterns: ["aptitude", "aptitude test", "quantitative aptitude", "logical reasoning", "verbal ability", "aptitude preparation"],
        responses: [
            "For aptitude test preparation:\n\n1. Quantitative Aptitude: Practice arithmetic, algebra, geometry\n2. Logical Reasoning: Puzzles, syllogisms, deductive reasoning\n3. Verbal Ability: Reading comprehension, grammar, vocabulary\n4. Data Interpretation: Charts, graphs, tables analysis\n\nRegular practice with timed tests is key. Check placement cell notifications for practice material.",
            "Aptitude preparation resources:\n\n1. Recommended books: R.S. Aggarwal, Arun Sharma\n2. Online platforms: IndiaBix, TestpotPro, Placement Preparation app\n3. Previous year papers: Available in the Resources section\n4. Campus workshops: Check Events calendar for upcoming sessions\n\nMost companies have a 30-40 minute aptitude section with sectional time limits."
        ]
    },

    hr_interview: {
        patterns: ["hr interview", "hr questions", "hr round", "behavioral questions", "hr preparation", "common hr questions"],
        responses: [
            "Common HR interview questions:\n\n1. Tell me about yourself\n2. Why do you want to join our company?\n3. Where do you see yourself in 5 years?\n4. Strengths and weaknesses\n5. Challenging situation you faced\n6. Why should we hire you?\n\nPrepare answers using the STAR method (Situation, Task, Action, Result).",
            "For HR interview preparation:\n\n1. Research the company culture and values\n2. Align your answers with company expectations\n3. Practice salary negotiation responses\n4. Prepare questions to ask the interviewer\n5. Work on confident body language\n\nMock HR interviews are conducted regularly - check the Events section."
        ]
    },

    internship: {
        patterns: ["internship", "internships", "summer internship", "intern", "internship opportunities", "how to get internship"],
        responses: [
            "Internship information:\n\n1. Summer Internships: Applications open in January-February\n2. Winter Internships: Applications in September-October\n3. Requirements: Similar to full-time placements but may have lower CGPA criteria\n4. Process: Resume submission, aptitude test, interviews\n\nMany internships convert to pre-placement offers (PPOs). Check the 'Upcoming Companies' section for current opportunities.",
            "To secure good internships:\n\n1. Build a portfolio of projects relevant to your field\n2. Participate in coding contests and hackathons\n3. Network with alumni working in target companies\n4. Apply early - most good internships fill up quickly\n\nThe placement cell also facilitates off-campus internships. Register your interest in the 'Internship' portal."
        ]
    },

    off_campus: {
        patterns: ["off campus", "off-campus placements", "external opportunities", "apply directly", "outside campus", "off campus jobs"],
        responses: [
            "Tips for off-campus opportunities:\n\n1. LinkedIn: Optimize profile and connect with recruiters\n2. Job Portals: Naukri, Indeed, Instahyre\n3. Company Careers Page: Apply directly\n4. Referrals: Network with alumni for referrals\n5. Hackathons & Competitions: Great for visibility\n\nThe placement office can verify your documents for off-campus applications too.",
            "Off-campus placement strategy:\n\n1. Create a job search schedule and apply consistently\n2. Customize resume for each application\n3. Follow up professionally after applications\n4. Prepare the same way as campus placements\n5. Join professional communities in your field\n\nNote: Inform the placement cell if you receive an off-campus offer."
        ]
    },

    higher_studies: {
        patterns: ["higher studies", "MS", "MTech", "MBA", "further studies", "abroad studies", "graduate school"],
        responses: [
            "Considering higher studies? Here's what to know:\n\n1. Exam preparation: GRE/GMAT/GATE based on your choice\n2. Application timeline: Most deadlines fall 9-12 months before start date\n3. Recommendation letters: Connect with professors early\n4. Statement of Purpose: Critical component of application\n\nYou can defer placements if admitted to top universities. Check placement policy for details.",
            "Higher education options after graduation:\n\n1. MS abroad: Focus on research, projects, and GRE scores\n2. MTech in India: Prepare for GATE examination\n3. MBA: Work experience of 1-2 years recommended first\n4. Research positions: Connect with professors for opportunities\n\nThe Career Development Cell offers guidance sessions on higher education paths."
        ]
    },

    startup: {
        patterns: ["startup", "own company", "entrepreneurship", "founding", "business idea", "incubation"],
        responses: [
            "Interested in startups and entrepreneurship?\n\n1. College Incubation Center provides mentorship and seed funding\n2. Entrepreneurship Development Cell conducts regular workshops\n3. Alumni Entrepreneur Network can help with connections\n4. Placement policies allow for startup deferment option\n\nVisit the Incubation Center (Block D, 3rd Floor) for more information.",
            "Resources for student entrepreneurs:\n\n1. Startup competitions with funding opportunities every semester\n2. Dedicated mentorship from industry experts and successful founders\n3. Co-working space available in Innovation Hub\n4. Legal and accounting support for registered student startups\n\nYou can apply for the Startup Track in the placement portal."
        ]
    },

    alumni_connect: {
        patterns: ["alumni", "alumni connect", "former students", "connect with alumni", "alumni network", "seniors advice"],
        responses: [
            "To connect with alumni:\n\n1. Alumni Portal: Available in the 'Connect with Alumni' section\n2. Alumni Mentorship Program: Get paired with a mentor in your field\n3. Alumni Talks: Regular webinars by successful graduates\n4. LinkedIn: Active alumni network with 10,000+ members\n\nMost alumni are happy to help with referrals and guidance.",
            "Benefits of alumni connections:\n\n1. Industry insights and current hiring trends\n2. Resume reviews from people working in target companies\n3. Mock interviews with relevant feedback\n4. Potential referrals for internships and jobs\n\nUpcoming Alumni Interaction session on Saturday - register in the Events section."
        ]
    },

    documents_required: {
        patterns: ["documents", "required documents", "what documents", "certificates needed", "placement documents"],
        responses: [
            "Documents required for placement registration:\n\n1. Updated resume (PDF format)\n2. All semester marksheets\n3. College ID card\n4. Aadhaar/PAN card\n5. Passport size photographs (digital and physical)\n6. Internship certificates (if any)\n\nSubmit digital copies through the 'Upload Resume' section and carry originals to interviews.",
            "Placement documentation checklist:\n\n1. Complete student profile on placement portal\n2. Academic records with CGPA calculation\n3. Government ID proofs (Aadhaar mandatory)\n4. Gap certificate (if applicable)\n5. Project certificates and publications\n\nDocument verification drive is held at the beginning of placement season."
        ]
    },

    default: {
        responses: [
            "I'm not sure I understand your question. Could you rephrase it or select from one of the suggested topics?",
            "I don't have information about that yet. Would you like to know about placement preparation, resume tips, or upcoming companies instead?",
            "That's beyond my current knowledge. Let me suggest some topics I can help with: interview preparation, placement policies, or eligibility criteria."
        ]
    }
};

// Function to match user input to intents
const matchIntent = (message) => {
    const lowerCaseMessage = message.toLowerCase();

    // Check each intent for matching patterns
    for (const [intentName, intentData] of Object.entries(intents)) {
        if (intentData.patterns) {
            for (const pattern of intentData.patterns) {
                if (lowerCaseMessage.includes(pattern)) {
                    return intentName;
                }
            }
        }
    }

    return "default";
};

// Function to get random response from intent
const getResponse = (intent) => {
    const responses = intents[intent].responses || intents.default.responses;
    return responses[Math.floor(Math.random() * responses.length)];
};

const ChatBot = () => {
    const router = useRouter();
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hello! I'm your Placement Plus Assistant. How can I help with your placement journey today?",
            sender: "bot",
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollViewRef = useRef(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const { theme } = useUser();
    const botMessageAnimation = useRef(new Animated.Value(0)).current;
    const userMessageAnimation = useRef(new Animated.Value(0)).current;
    // console.log("messages: ", messages);


    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                scrollToBottom();
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true
                }).start();
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true
                }).start();
            }
        );

        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
        }).start();

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const scrollToBottom = () => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
    };

    useEffect(() => {
        scrollToBottom();

        // Animate the latest message
        if (messages.length > 0) {
            const latestMessage = messages[messages.length - 1];

            if (latestMessage.sender === 'bot') {
                Animated.spring(botMessageAnimation, {
                    toValue: 1,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true
                }).start();
            } else {
                Animated.spring(userMessageAnimation, {
                    toValue: 1,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true
                }).start();
            }
        }
    }, [messages]);

    const handleSend = () => {
        if (inputText.trim() === "") return;

        // Reset animations
        botMessageAnimation.setValue(0);
        userMessageAnimation.setValue(0);

        // Add user message
        const userMessage = {
            id: messages.length + 1,
            text: inputText.trim(),
            sender: "user",
            timestamp: new Date()
        };

        setMessages(prevMessages => [...prevMessages, userMessage]);
        setInputText("");
        setIsTyping(true);

        // Simulate bot processing time
        setTimeout(() => {
            const intent = matchIntent(userMessage.text);
            const botResponse = getResponse(intent);

            // Handle response with button
            if (typeof botResponse === 'object' && botResponse.text) {
                const botMessage = {
                    id: messages.length + 2,
                    text: botResponse.text,
                    sender: "bot",
                    timestamp: new Date(),
                    button: botResponse.button
                };
                setMessages(prevMessages => [...prevMessages, botMessage]);
            } else {
                // Regular text response
                const botMessage = {
                    id: messages.length + 2,
                    text: botResponse,
                    sender: "bot",
                    timestamp: new Date()
                };
                setMessages(prevMessages => [...prevMessages, botMessage]);
            }
            setIsTyping(false);
        }, 1000);
    };

    const handleQuickQuestion = (question) => {
        botMessageAnimation.setValue(0);
        userMessageAnimation.setValue(0);

        const userMessage = {
            id: messages.length + 1,
            text: question,
            sender: "user",
            timestamp: new Date()
        };

        setMessages(prevMessages => [...prevMessages, userMessage]);
        setIsTyping(true);

        // Simulate bot processing time
        setTimeout(() => {
            const intent = matchIntent(question);
            const botResponse = getResponse(intent);

            // Handle response with button
            if (typeof botResponse === 'object' && botResponse.text) {
                const botMessage = {
                    id: messages.length + 2,
                    text: botResponse.text,
                    sender: "bot",
                    timestamp: new Date(),
                    button: botResponse.button
                };
                setMessages(prevMessages => [...prevMessages, botMessage]);
            } else {
                // Regular text response
                const botMessage = {
                    id: messages.length + 2,
                    text: botResponse,
                    sender: "bot",
                    timestamp: new Date()
                };
                setMessages(prevMessages => [...prevMessages, botMessage]);
            }
            setIsTyping(false);
        }, 1000);
    };

    const handleButtonPress = (route) => {
        router.push(route);
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // const renderMessageBubble = (message, index) => {
    //     const isLatestBotMessage = index === messages.length - 1 && message.sender === 'bot';
    //     const isLatestUserMessage = index === messages.length - 1 && message.sender === 'user';

    //     const animationStyle = {
    //         opacity: isLatestBotMessage ? botMessageAnimation : isLatestUserMessage ? userMessageAnimation : 1,
    //         transform: [
    //             {
    //                 translateY: isLatestBotMessage || isLatestUserMessage
    //                     ? (message.sender === 'bot'
    //                         ? botMessageAnimation.interpolate({
    //                             inputRange: [0, 1],
    //                             outputRange: [20, 0]
    //                         })
    //                         : userMessageAnimation.interpolate({
    //                             inputRange: [0, 1],
    //                             outputRange: [20, 0]
    //                         })
    //                     )
    //                     : 0
    //             }
    //         ]
    //     };

    //     return (
    //         <Animated.View
    //             key={message.id}
    //             style={[
    //                 styles.messageWrapper,
    //                 message.sender === "user" ? styles.userMessageWrapper : styles.botMessageWrapper,
    //                 animationStyle
    //             ]}
    //         >
    //             {message.sender === "bot" && (
    //                 <Image source={botAvatar} style={styles.messageAvatar} />
    //             )}
    //             <View style={styles.messageContentContainer}>
    //                 <View
    //                     style={[
    //                         styles.messageBubble,
    //                         message.sender === "user" ? styles.userBubble : styles.botBubble
    //                     ]}
    //                 >
    //                     <Text style={styles.messageText}>{message.text}</Text>
    //                     <Text style={styles.messageTime}>{formatTime(message.timestamp)}</Text>
    //                 </View>

    //                 {message.button && (
    //                     <TouchableOpacity
    //                         style={styles.messageButton}
    //                         onPress={() => handleButtonPress(message.button.route)}
    //                     >
    //                         <Text style={styles.messageButtonText}>{message.button.label}</Text>
    //                     </TouchableOpacity>
    //                 )}
    //             </View>
    //             {message.sender === "user" && (
    //                 <View style={styles.userAvatarContainer}>
    //                     <FontAwesome name="user" size={18} color="#fff" style={styles.userAvatar} />
    //                 </View>
    //             )}
    //         </Animated.View>
    //     );
    // };
    const renderMessageBubble = (message, index) => {
        const isLatestMessage = index === messages.length - 1;
        const isBot = message.sender === 'bot';
        const isUser = message.sender === 'user';

        const animationValue = isBot ? botMessageAnimation : userMessageAnimation;

        const animationStyle = {
            opacity: isLatestMessage ? animationValue : 1,
            transform: [
                {
                    translateY: isLatestMessage
                        ? animationValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0],
                        })
                        : new Animated.Value(0),
                },
            ],
        };

        return (
            <Animated.View
                key={message.id}
                style={[
                    styles.messageWrapper,
                    isUser ? styles.userMessageWrapper : styles.botMessageWrapper,
                    animationStyle,
                ]}
            >
                {isBot && <Image source={botAvatar} style={styles.messageAvatar} />}

                <View style={styles.messageContentContainer}>
                    <View
                        style={[
                            styles.messageBubble,
                            isUser ? styles.userBubble : styles.botBubble,
                        ]}
                    >
                        <Text style={styles.messageText}>{message.text}</Text>
                        <Text style={styles.messageTime}>
                            {message.timestamp ? formatTime(message.timestamp) : ''}
                        </Text>
                    </View>

                    {message.button && (
                        <TouchableOpacity
                            style={styles.messageButton}
                            onPress={() => handleButtonPress(message.button.route)}
                        >
                            <Text style={styles.messageButtonText}>
                                {message.button.label}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {isUser && (
                    <View style={styles.userAvatarContainer}>
                        <FontAwesome
                            name="user"
                            size={18}
                            color="#fff"
                            style={styles.userAvatar}
                        />
                    </View>
                )}
            </Animated.View>
        );
    };

    useEffect(() => {
        if (messages.length === 0) return;

        const latestMessage = messages[messages.length - 1];
        const animation = latestMessage.sender === 'bot' ? botMessageAnimation : userMessageAnimation;

        animation.setValue(0);
        Animated.timing(animation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [messages]);

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#1D0A3F', '#14011F']}
                style={styles.backgroundGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerTitle}>
                    <Image source={botAvatar} style={styles.headerAvatar} />
                    <View>
                        <Text style={styles.headerName}>Placement Assistant</Text>
                        <Text style={styles.headerStatus}>Always here to help</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.moreButton}>
                    <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Messages */}
            <ScrollView
                ref={scrollViewRef}
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
            >
                {messages.map((message, index) => renderMessageBubble(message, index))}

                {isTyping && (
                    <View style={styles.typingIndicator}>
                        <Image source={botAvatar} style={styles.messageAvatar} />
                        <View style={styles.typingBubble}>
                            <View style={styles.typingAnimation}>
                                <Animated.View style={[styles.typingDot, styles.typingDot1]} />
                                <Animated.View style={[styles.typingDot, styles.typingDot2]} />
                                <Animated.View style={[styles.typingDot, styles.typingDot3]} />
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Quick Questions Horizontal Scroll */}
            <Animated.View style={[styles.quickQuestionsContainer, { opacity: fadeAnim }]}>
                <Text style={styles.quickQuestionsTitle}>Quick Questions</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.quickQuestionsScroll}
                >
                    {quickQuestions.map((question, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.quickQuestionButton}
                            onPress={() => handleQuickQuestion(question)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.quickQuestionText}>{question}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </Animated.View>

            {/* Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
                style={styles.inputContainer}
            >
                <TouchableOpacity style={styles.attachButton}>
                    <Ionicons name="add-circle-outline" size={24} color="#9D9DB5" />
                </TouchableOpacity>
                <View style={styles.textInputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Ask anything about placements..."
                        placeholderTextColor="#9D9DB5"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxLength={500}
                    />
                    <TouchableOpacity style={styles.emojiButton}>
                        <Ionicons name="happy-outline" size={24} color="#9D9DB5" />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        inputText.trim() === "" ? styles.sendButtonDisabled : styles.sendButtonActive
                    ]}
                    onPress={handleSend}
                    disabled={inputText.trim() === ""}
                    activeOpacity={0.7}
                >
                    <Ionicons name="send" size={20} color="#fff" />
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#14011F"
    },
    backgroundGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, 0.1)",
        backgroundColor: "rgba(29, 10, 63, 0.8)",
        marginTop: 20
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 10,
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    headerName: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    headerStatus: {
        color: "#9D9DB5",
        fontSize: 12,
    },
    moreButton: {
        padding: 5,
    },
    messagesContainer: {
        flex: 1,
        padding: 10,
    },
    messagesContent: {
        paddingBottom: 10,
    },
    messageWrapper: {
        marginBottom: 15,
        flexDirection: "row",
        alignItems: "flex-end",
    },
    userMessageWrapper: {
        justifyContent: "flex-end",
    },
    botMessageWrapper: {
        justifyContent: "flex-start",
    },
    messageAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 8,
    },
    userAvatarContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#6937C5",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 8,
    },
    userAvatar: {
        textAlign: "center",
    },
    messageContentContainer: {
        maxWidth: "75%",
    },
    messageBubble: {
        padding: 12,
        borderRadius: 18,
        marginBottom: 5,
    },
    userBubble: {
        backgroundColor: "#6937C5",
        borderTopRightRadius: 0,
    },
    botBubble: {
        backgroundColor: "#332155",
        borderTopLeftRadius: 0,
    },
    messageText: {
        color: "#fff",
        fontSize: 15,
        lineHeight: 22,
    },
    messageTime: {
        color: "rgba(255, 255, 255, 0.6)",
        fontSize: 10,
        marginTop: 5,
        alignSelf: "flex-end",
    },
    messageButton: {
        backgroundColor: "#6937C5",
        padding: 12,
        borderRadius: 12,
        alignSelf: "flex-start",
        marginTop: 8,
    },
    messageButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    typingIndicator: {
        flexDirection: "row",
        alignItems: "flex-end",
        marginBottom: 15,
    },
    typingBubble: {
        backgroundColor: "#332155",
        padding: 12,
        borderRadius: 18,
        borderTopLeftRadius: 0,
    },
    typingAnimation: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 20,
        width: 50,
    },
    typingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#fff",
        marginHorizontal: 3,
        opacity: 0.6,
    },
    typingDot1: {
        animationName: "typingAnimation",
        animationDuration: "1s",
        animationIterationCount: "infinite",
        animationDelay: "0s",
    },
    typingDot2: {
        animationName: "typingAnimation",
        animationDuration: "1s",
        animationIterationCount: "infinite",
        animationDelay: "0.2s",
    },
    typingDot3: {
        animationName: "typingAnimation",
        animationDuration: "1s",
        animationIterationCount: "infinite",
        animationDelay: "0.4s",
    },
    quickQuestionsContainer: {
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: "rgba(255, 255, 255, 0.1)",
    },
    quickQuestionsTitle: {
        color: "#9D9DB5",
        fontSize: 14,
        marginBottom: 10,
    },
    quickQuestionsScroll: {
        paddingRight: 15,
    },
    quickQuestionButton: {
        backgroundColor: "#332155",
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginRight: 10,
    },
    quickQuestionText: {
        color: "#fff",
        fontSize: 13,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: "rgba(255, 255, 255, 0.1)",
        backgroundColor: "rgba(29, 10, 63, 0.8)",
    },
    attachButton: {
        padding: 8,
    },
    textInputContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#28184C",
        borderRadius: 20,
        marginHorizontal: 8,
        paddingHorizontal: 15,
    },
    textInput: {
        flex: 1,
        color: "#fff",
        fontSize: 15,
        paddingVertical: 10,
        maxHeight: 100,
    },
    emojiButton: {
        padding: 8,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    sendButtonActive: {
        backgroundColor: "#6937C5",
    },
    sendButtonDisabled: {
        backgroundColor: "#3D2A6A",
    }
});

export default ChatBot;